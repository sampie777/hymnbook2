import { SkFont, Skia } from "@shopify/react-native-skia";
import { AbcSong, VoiceItem } from "@hymnbook/abc";
import { AbcConfig } from "./config";
import {
  getNoteAccidental,
  getNoteChar,
  getNoteDot,
  getNoteLyrics,
  getNoteRest,
  MelodyTextAlignment,
} from "../../../logic/songs/abc/utils.ts";

export enum Alignment {
  Left,
  Center,
  Right
}

export interface ScoreItem {
  char: string;
  lyric: string;
  chord: string;
  isEndBar: boolean;
  minPitch: number;
}

export interface PositionItem extends ScoreItem {
  y: number;
  xNote: number;
  xLyric: number;
  xChord: number;
  dashX?: number;
  lyricOffsetY: number;
}

export interface MeasuredItem {
  item: ScoreItem;
  noteWidth: number;
  lyricWidth: number;
  chordWidth: number;
  contentWidth: number;
}

/**
 * Creates the initial clef item pinned to the start of the score.
 */
export const createClefItem = (abcSong: AbcSong): ScoreItem => ({
  char: abcSong?.clef?.type !== "bass" ? " &" : " 0",
  lyric: "",
  chord: "",
  isEndBar: false,
  minPitch: Infinity,
});

/**
 * Maps a raw ABC VoiceItem into a standardized ScoreItem containing only
 * the parsed text, lyrics, chords, and the lowest pitch required for rendering.
 */
export const mapVoiceItem = (item: VoiceItem): ScoreItem => {
  let note = "";
  let lyric = "";
  let chord = "";
  let isEndBar = false;
  let minPitch = Infinity;

  if (item.el_type === "note") {
    // Extract the lowest pitch to dynamically push lyrics down if needed later
    item.pitches?.forEach((pitch) => {
      minPitch = Math.min(minPitch, pitch.pitch);

      const noteAccidental = getNoteAccidental(pitch.pitch, pitch.accidental);
      const noteChar = getNoteChar(pitch.pitch, item.duration);
      const noteDot = getNoteDot(pitch.pitch, item.duration);
      note += noteAccidental + noteChar + noteDot;
    });
    note += getNoteRest(item) ?? "";

    lyric = getNoteLyrics(item);

    chord = item.chord?.map(c => c.name
      .replace(/♭/g, "b")
      .replace(/♯/g, "#")
    ).join(" ") || "";
  } else if (item.el_type === "bar") {
    note = item.type === "bar_thin_thick" ? "." : "Ā";
    isEndBar = item.type === "bar_thin_thick";
  }

  return { char: note, lyric, chord, isEndBar, minPitch };
};

/**
 * Flattens the ABC AST into an array of score items.
 * Respects the showMelodyOnSeparateLines flag.
 */
export const extractScoreLines = (abcSong: AbcSong, clefItem: ScoreItem, showMelodyOnSeparateLines: boolean): ScoreItem[][] => {
  if (!abcSong?.melody) return [];

  if (showMelodyOnSeparateLines) {
    return abcSong.melody.map((line: VoiceItem[], index: number) => {
      const lineItems = line.map(mapVoiceItem);
      return index === 0 ? [clefItem, ...lineItems] : lineItems;
    });
  }

  const allItems: ScoreItem[] = [clefItem];
  abcSong.melody.flat().forEach((item: VoiceItem) => {
    allItems.push(mapVoiceItem(item));
  });
  return [allItems];
};

/**
 * Pre-measures the physical Skia pixel width of every item (notes, lyrics, chords)
 * so the line-breaking algorithm can wrap rows mathematically based on true scale.
 */
export const measureScoreLines = (
  rawScoreLines: ScoreItem[][],
  musicFont: SkFont,
  lyricFont: SkFont,
  chordFont: SkFont,
  currentMelodyScale: number,
  showChords: boolean
): MeasuredItem[][] => {
  return rawScoreLines.map((phraseItems) => {
    return phraseItems.map((item) => {
      const noteWidth = musicFont.measureText(item.char).width * currentMelodyScale;
      const lyricWidth = item.lyric ? lyricFont.measureText(item.lyric).width : 0;
      const chordWidth = showChords && item.chord
        ? chordFont.measureText(item.chord).width * currentMelodyScale
        : 0;

      // The bounding box for the item is dictated by its widest element
      const contentWidth = Math.max(noteWidth, lyricWidth, chordWidth);

      return { item, noteWidth, lyricWidth, chordWidth, contentWidth };
    });
  });
};

/**
 * Accumulated Width Greedy Wrapper:
 * Dynamically slices the phrase into balanced rows. It guarantees no line
 * will exceed the canvas width by accumulating physical font widths.
 */
export const balanceRows = (
  measuredPhrases: MeasuredItem[][],
  effectiveWidth: number,
  currentMelodyScale: number,
  textAlignment: MelodyTextAlignment,
  clefItem: ScoreItem
): MeasuredItem[][] => {
  const balancedRows: MeasuredItem[][] = [];
  const standardSpacing = 16 * currentMelodyScale;

  measuredPhrases.forEach((measuredPhrase) => {
    const leftPadding = textAlignment === MelodyTextAlignment.Left ? 25 * currentMelodyScale : 0;
    const rowChromeWidth = leftPadding + (measuredPhrase[0].item === clefItem ? measuredPhrase[0].contentWidth + standardSpacing : 0);
    const maxLineWidth = Math.max(50, effectiveWidth - rowChromeWidth - (20 * currentMelodyScale));

    let totalPhraseWidth = 0;
    measuredPhrase.forEach((m, idx) => {
      totalPhraseWidth += m.contentWidth + (idx > 0 ? standardSpacing : 0);
    });

    let targetLines = Math.max(1, Math.ceil(totalPhraseWidth / maxLineWidth));
    const totalItems = measuredPhrase.length;
    let startIndex = 0;

    for (let line = 0; line < targetLines; line++) {
      if (startIndex >= totalItems) break;

      // Calculate an ideal width target to distribute items as evenly as possible across the remaining lines
      let remainingWidth = 0;
      for (let i = startIndex; i < totalItems; i++) {
        remainingWidth += measuredPhrase[i].contentWidth + (i > startIndex ? standardSpacing : 0);
      }

      const remainingLines = targetLines - line;
      const idealLineTarget = remainingWidth / remainingLines;

      let currentWidth = 0;
      let cutIndex = startIndex;

      for (let i = startIndex; i < totalItems; i++) {
        let w = measuredPhrase[i].contentWidth + (i > startIndex ? standardSpacing : 0);

        // Absolute maximum breached; force a line break immediately
        if (currentWidth + w > maxLineWidth && cutIndex > startIndex) {
          break;
        }

        // Ideal distribution met for this line; gracefully break early
        if (currentWidth > 0 && currentWidth + (w / 2) >= idealLineTarget && remainingLines > 1) {
          break;
        }

        currentWidth += w;
        cutIndex++;
      }

      // Failsafe: guarantee loop progression in edge cases (extreme zoom/very long single word)
      if (cutIndex === startIndex) {
        cutIndex++;
      }

      balancedRows.push(measuredPhrase.slice(startIndex, cutIndex));
      startIndex = cutIndex;

      // If items were left behind at the end of the calculated target lines, add an extra line
      if (line === targetLines - 1 && startIndex < totalItems) {
        targetLines++;
      }
    }
  });

  return balancedRows;
};

/**
 * Takes the cleanly wrapped rows and computes exact X/Y coordinates for the Skia Canvas.
 * Handles dynamic staff height adjustments based on chord presence and low-pitch notes.
 */
export const computeLayout = (
  balancedRows: MeasuredItem[][],
  effectiveWidth: number,
  currentMelodyScale: number,
  showChords: boolean,
  textAlignment: MelodyTextAlignment,
  clefItem: ScoreItem,
  lyricFont: SkFont
) => {
  const path = Skia.Path.Make();
  const positions: PositionItem[] = [];

  const baseStaffHeight = 40 * currentMelodyScale;
  const baseChordOffsetValue = 30 * currentMelodyScale;
  const topMarginValue = AbcConfig.chordSize * currentMelodyScale;
  const standardSpacing = 16 * currentMelodyScale;

  let currentY = 5;
  let maxBottomY = currentY;

  balancedRows.forEach((rowItems, rowIndex) => {
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === balancedRows.length - 1;

    const hasClef = isFirstRow && rowItems.length > 0 && rowItems[0].item === clefItem;
    const hasEndBar = isLastRow && rowItems.length > 0 && rowItems[rowItems.length - 1].item.isEndBar;

    const startIndex = hasClef ? 1 : 0;
    const endIndex = hasEndBar ? rowItems.length - 1 : rowItems.length;
    const middleItems = rowItems.slice(startIndex, endIndex);

    const leftBound = 10;
    const rightBound = effectiveWidth + 10;

    // Determine chord height requirement specifically for THIS row
    const rowHasChords = showChords && rowItems.some(m => Boolean(m.item.chord?.trim()));
    const rowChordOffset = rowHasChords ? baseChordOffsetValue : 0;
    const rowTopMargin = (isFirstRow && rowHasChords) ? topMarginValue : 0;

    // Staff baseline incorporates this specific row's chord and top height requirements
    const staffY = currentY + rowTopMargin + rowChordOffset + baseStaffHeight;

    // Evaluate the absolute lowest pitch in the row to calculate necessary text clearance
    let rowMinPitch = Infinity;
    rowItems.forEach((m) => {
      rowMinPitch = Math.min(rowMinPitch, m.item.minPitch);
    });

    // Linear drop multiplier: Pushes lyrics down incrementally for every pitch step below -1
    let extraLyricDrop = 0;
    if (rowMinPitch < -1) {
      const pitchStepsBelowBase = -1 - rowMinPitch;
      extraLyricDrop = 6 + pitchStepsBelowBase * (2 * currentMelodyScale);
    }

    const currentLyricOffset = 30 + extraLyricDrop;

    // Calculate total layout width of the dynamic middle section for alignment distribution
    let middleWidth = 0;
    middleItems.forEach((m, idx) => {
      middleWidth += m.contentWidth + (idx > 0 ? standardSpacing : 0);
    });

    const clefWidth = hasClef ? rowItems[0].noteWidth : 0;
    const leftPadding = textAlignment === MelodyTextAlignment.Left ? 25 * currentMelodyScale : 0;

    const innerLeft = leftBound + (hasClef ? clefWidth + standardSpacing : 0) + leftPadding;
    let currentX = innerLeft;

    if (textAlignment === MelodyTextAlignment.Center) {
      const endBarWidth = hasEndBar ? rowItems[rowItems.length - 1].noteWidth : 0;
      const innerRight = rightBound - (hasEndBar ? endBarWidth + standardSpacing : 0);
      const availableMiddleSpace = Math.max(0, innerRight - innerLeft);
      currentX = innerLeft + Math.max(0, (availableMiddleSpace - middleWidth) / 2);
    }

    if (middleItems.length === 0) {
      currentX = innerLeft;
    }

    let prevWordDashed = false;

    // 1. Pin Clef
    if (hasClef) {
      positions.push({
        ...rowItems[0].item,
        y: staffY,
        xNote: leftBound,
        xLyric: leftBound,
        xChord: leftBound,
        lyricOffsetY: currentLyricOffset,
      });
    }

    // 2. Render middle items iteratively
    middleItems.forEach((m, idx) => {
      if (idx > 0) {
        currentX += standardSpacing;
      }

      const trimmedLyric = m.item.lyric.trim();
      const currDashed = trimmedLyric.endsWith("-");
      const isLastInRow = idx === middleItems.length - 1;

      // Ensure hyphens at line breaks are preserved inside the text payload
      const cleanLyric = (currDashed && !isLastInRow) ? trimmedLyric.slice(0, -1).trim() : trimmedLyric;
      const cleanLyricWidth = cleanLyric ? lyricFont.measureText(cleanLyric).width : 0;

      // Smart alignment: Pull hyphenated words closer together to indicate continuation
      let align = Alignment.Center;
      if (m.item.lyric) {
        if (currDashed && !prevWordDashed) {
          align = Alignment.Right;
        } else if (currDashed && prevWordDashed) {
          align = Alignment.Center;
        } else if (!currDashed && prevWordDashed) {
          align = Alignment.Left;
        }
      }

      let shiftX = 0;
      const shiftAmount = standardSpacing * 0.4;
      if (align === Alignment.Right) {
        shiftX = shiftAmount;
      } else if (align === Alignment.Left) {
        shiftX = -shiftAmount;
      }

      const centerX = currentX + shiftX + (m.contentWidth / 2);
      const xNote = centerX - (m.noteWidth / 2);
      const rightEdge1 = centerX + (cleanLyricWidth / 2);

      // Dash calculation: Find absolute center space between this word and the next
      let dashX = undefined;
      if (currDashed && !isLastInRow && idx + 1 < middleItems.length) {
        const nextM = middleItems[idx + 1];
        const nextGap = standardSpacing;

        const nextTrimmed = nextM.item.lyric.trim();
        const nextDashed = nextTrimmed.endsWith("-");
        const nextClean = nextDashed ? nextTrimmed.slice(0, -1).trim() : nextTrimmed;
        const nextCleanWidth = nextClean ? lyricFont.measureText(nextClean).width : 0;

        const nextShiftX = (nextM.item.lyric && !nextDashed) ? -shiftAmount : 0;

        const currentXNext = currentX + m.contentWidth + nextGap;
        const nextCenterX = currentXNext + nextShiftX + (nextM.contentWidth / 2);
        const leftEdge2 = nextCenterX - (nextCleanWidth / 2);

        const dashWidth = lyricFont.measureText("-").width;
        dashX = ((rightEdge1 + leftEdge2) / 2) - (dashWidth / 2);
      }

      positions.push({
        ...m.item,
        lyric: cleanLyric,
        dashX,
        y: staffY,
        xNote,
        xLyric: centerX - (cleanLyricWidth / 2),
        xChord: centerX - (m.chordWidth / 2),
        lyricOffsetY: currentLyricOffset,
      });

      currentX += m.contentWidth;
      prevWordDashed = currDashed;
    });

    // 3. Pin End Bar
    if (hasEndBar) {
      const m = rowItems[rowItems.length - 1];
      const xNote = rightBound - m.noteWidth;
      positions.push({
        ...m.item,
        y: staffY,
        xNote,
        xLyric: xNote,
        xChord: xNote,
        lyricOffsetY: currentLyricOffset,
      });
    }

    // Draw staff lines from left-to-right margins
    for (let j = 0; j < 5; j++) {
      const lineOffset = staffY - (j * 10 * currentMelodyScale) + 0.7;
      path.moveTo(leftBound, lineOffset);
      path.lineTo(rightBound, lineOffset);
    }

    // Store highest bottom bound reached by current row to guarantee clipping bounds
    maxBottomY = Math.max(maxBottomY, staffY + currentLyricOffset + 20);

    // Step forward cleanly to prep for the next row
    currentY = staffY + currentLyricOffset + 20;
  });

  return { positions, staffPath: path, maxBottomY };
};