import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, Group, Path, Skia, Text, useFont } from "@shopify/react-native-skia";
import { runOnJS, SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
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
import { isDevelopmentEnv } from "../../../logic/utils/utils.ts";
import { isMacOS } from "react-native-reanimated/src/PlatformChecker.ts";

enum Alignment {
  Left,
  Center,
  Right
}

interface ScoreItem {
  char: string;
  lyric: string;
  chord: string;
  isEndBar: boolean;
}

interface PositionItem extends ScoreItem {
  y: number;
  xNote: number;
  xLyric: number;
  xChord: number;
  dashX?: number;
}

interface Props {
  abcSong: AbcSong;
  animatedScale: SharedValue<number>;
  melodyScale: SharedValue<number>;
  showChords: boolean;
  showMelodyOnSeparateLines?: boolean;
  availableWidth: number;
  marginLeft?: number;
  marginRight?: number;
  onLoaded?: () => void;
  textAlignment?: MelodyTextAlignment;
}

const SkiaMelodyView: React.FC<Props> = ({
                                           abcSong,
                                           animatedScale,
                                           melodyScale,
                                           showChords,
                                           showMelodyOnSeparateLines = false,
                                           availableWidth,
                                           marginLeft = 0,
                                           marginRight = 0,
                                           onLoaded,
                                           textAlignment = MelodyTextAlignment.Left,
                                         }) => {
  const canvasWidth = availableWidth - marginLeft - marginRight;

  const [currentZoom, setCurrentZoom] = useState(animatedScale.value);
  const [currentMelodyScale, setCurrentMelodyScale] = useState(melodyScale.value * AbcConfig.baseScale);

  const lastReportedZoom = useSharedValue(currentZoom);
  const lastReportedMelodyScale = useSharedValue(currentMelodyScale);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledUpdate = (zoom: number, mScale: number) => {
    setCurrentZoom(zoom);
    setCurrentMelodyScale(mScale);

    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);

    settleTimeoutRef.current = setTimeout(() => {
      setCurrentZoom(animatedScale.value);
      setCurrentMelodyScale(melodyScale.value * AbcConfig.baseScale);
    }, 150);
  };

  useAnimatedReaction(
    () => ({
      zoom: animatedScale.value,
      mScale: melodyScale.value * AbcConfig.baseScale
    }),
    (current) => {
      const zoomDiff = Math.abs(current.zoom - lastReportedZoom.value);
      const mScaleDiff = Math.abs(current.mScale - lastReportedMelodyScale.value);

      if (zoomDiff > 0.025 || mScaleDiff > 0.01) {
        lastReportedZoom.value = current.zoom;
        lastReportedMelodyScale.value = current.mScale;
        runOnJS(throttledUpdate)(current.zoom, current.mScale);
      }
    },
    [animatedScale, melodyScale]
  );

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setLayoutReady(false);
  }, [abcSong, showMelodyOnSeparateLines]);

  const [layoutReady, setLayoutReady] = useState(false);

  const musicFont = useFont(require("../../../../assets/fonts/MusiQwikCustom.ttf"), AbcConfig.noteSize);
  const lyricFont = useFont(require("../../../../assets/fonts/Roboto-Regular.ttf"), AbcConfig.textSize);
  const chordFont = useFont(require("../../../../assets/fonts/Roboto-Regular.ttf"), AbcConfig.chordSize);

  const clefItem: ScoreItem = useMemo(() => ({
    char: abcSong?.clef?.type !== "bass" ? " &" : " 0",
    lyric: "",
    chord: "",
    isEndBar: false
  }), [abcSong?.clef?.type]);

  const mapVoiceItem = (item: VoiceItem): ScoreItem => {
    let note = "";
    let lyric = "";
    let chord = "";
    let isEndBar = false;

    if (item.el_type === "note") {
      item.pitches?.forEach((pitch) => {
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

    return { char: note, lyric, chord, isEndBar };
  };

  const rawScoreLines: ScoreItem[][] = useMemo(() => {
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
  }, [abcSong, clefItem, showMelodyOnSeparateLines]);

  const layoutData = useMemo(() => {
    if (!musicFont || !lyricFont || !chordFont || canvasWidth <= 0 || rawScoreLines.length === 0) return null;

    const path = Skia.Path.Make();
    const positions: PositionItem[] = [];

    const baseStaffHeight = 40 * currentMelodyScale;
    const baseChordOffset = showChords ? 30 * currentMelodyScale : 0;
    const lineHeight = baseStaffHeight + baseChordOffset + 50;

    const effectiveWidth = Math.max((canvasWidth / currentZoom) - 20, 50);
    const standardSpacing = 16 * currentMelodyScale;

    interface MeasuredItem {
      item: ScoreItem;
      noteWidth: number;
      lyricWidth: number;
      chordWidth: number;
      contentWidth: number;
    }

    const balancedRows: MeasuredItem[][] = [];

    const layoutRowItems = (rowItems: MeasuredItem[], rowIndex: number) => {
      const isFirstRow = rowIndex === 0;
      const isLastRow = rowIndex === balancedRows.length - 1;

      const hasClef = isFirstRow && rowItems.length > 0 && rowItems[0].item === clefItem;
      const hasEndBar = isLastRow && rowItems.length > 0 && rowItems[rowItems.length - 1].item.isEndBar;

      const startIndex = hasClef ? 1 : 0;
      const endIndex = hasEndBar ? rowItems.length - 1 : rowItems.length;
      const middleItems = rowItems.slice(startIndex, endIndex);

      const leftBound = 10;
      const rightBound = effectiveWidth + 10;

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

      // 1. Pin Clef to left edge
      if (hasClef) {
        positions.push({
          ...rowItems[0].item,
          y: currentY,
          xNote: leftBound,
          xLyric: leftBound,
          xChord: leftBound,
        });
      }

      // 2. Render middle items
      middleItems.forEach((m, idx) => {
        if (idx > 0) {
          currentX += standardSpacing;
        }

        const trimmedLyric = m.item.lyric.trim();
        const currDashed = trimmedLyric.endsWith("-");
        const isLastInRow = idx === middleItems.length - 1;

        // If it's dashed but lands at the end of the line, KEEP the dash attached to the text natively
        const cleanLyric = (currDashed && !isLastInRow) ? trimmedLyric.slice(0, -1).trim() : trimmedLyric;
        const cleanLyricWidth = cleanLyric ? lyricFont.measureText(cleanLyric).width : 0;

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
          y: currentY,
          xNote,
          xLyric: centerX - (cleanLyricWidth / 2),
          xChord: centerX - (m.chordWidth / 2),
        });

        currentX += m.contentWidth;
        prevWordDashed = currDashed;
      });

      // 3. Pin End Bar to the far right edge
      if (hasEndBar) {
        const m = rowItems[rowItems.length - 1];
        const xNote = rightBound - m.noteWidth;
        positions.push({
          ...m.item,
          y: currentY,
          xNote,
          xLyric: xNote,
          xChord: xNote,
        });
      }

      // Draw full-width staff lines edge-to-edge
      for (let j = 0; j < 5; j++) {
        const lineOffset = currentY - (j * 10 * currentMelodyScale) + 0.7;
        path.moveTo(leftBound, lineOffset);
        path.lineTo(rightBound, lineOffset);
      }

      currentY += lineHeight;
    };

    rawScoreLines.forEach((phraseItems) => {
      const measuredPhrase: MeasuredItem[] = phraseItems.map((item) => {
        const noteWidth = musicFont.measureText(item.char).width * currentMelodyScale;
        const lyricWidth = item.lyric ? lyricFont.measureText(item.lyric).width : 0;
        const chordWidth = showChords && item.chord
          ? chordFont.measureText(item.chord).width * currentMelodyScale
          : 0;
        const contentWidth = Math.max(noteWidth, lyricWidth, chordWidth);
        return { item, noteWidth, lyricWidth, chordWidth, contentWidth };
      });

      const leftPadding = textAlignment === MelodyTextAlignment.Left ? 25 * currentMelodyScale : 0;
      const rowChromeWidth = leftPadding + (measuredPhrase[0].item === clefItem ? measuredPhrase[0].contentWidth + standardSpacing : 0);

      // Calculate a strict hard bound for the line to ensure it never overflows right edge
      const maxLineWidth = Math.max(50, effectiveWidth - rowChromeWidth - (20 * currentMelodyScale));

      let totalPhraseWidth = 0;
      measuredPhrase.forEach((m, idx) => {
        totalPhraseWidth += m.contentWidth + (idx > 0 ? standardSpacing : 0);
      });

      let targetLines = Math.max(1, Math.ceil(totalPhraseWidth / maxLineWidth));
      const totalItems = measuredPhrase.length;
      let startIndex = 0;

      // Evenly distribute by ACCUMULATED WIDTH, not item count
      for (let line = 0; line < targetLines; line++) {
        if (startIndex >= totalItems) break;

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

          if (currentWidth + w > maxLineWidth && cutIndex > startIndex) {
            break; // Absolute max boundary breached
          }

          if (currentWidth > 0 && currentWidth + (w / 2) >= idealLineTarget && remainingLines > 1) {
            break; // Ideal even distribution met
          }

          currentWidth += w;
          cutIndex++;
        }

        // Failsafe to guarantee loop progression if extreme zoom is applied
        if (cutIndex === startIndex) {
          cutIndex++;
        }

        balancedRows.push(measuredPhrase.slice(startIndex, cutIndex));
        startIndex = cutIndex;

        // If items were left behind, forcefully increase lines to catch overflow
        if (line === targetLines - 1 && startIndex < totalItems) {
          targetLines++;
        }
      }
    });

    let currentY = lineHeight - 50;

    balancedRows.forEach((rowItems, rowIndex) => {
      layoutRowItems(rowItems, rowIndex);
    });

    let totalScaledHeight = (currentY + 50) * currentZoom;
    // Limit to 2730 for simulator on macos as a higher value will crash the app
    if (isDevelopmentEnv && isMacOS()) totalScaledHeight = Math.min(totalScaledHeight, 2730);

    return { positions, staffPath: path, canvasHeight: totalScaledHeight };
  }, [rawScoreLines, currentZoom, currentMelodyScale, canvasWidth, musicFont, lyricFont, chordFont, showChords, textAlignment, clefItem]);

  useEffect(() => {
    if (layoutData && musicFont && lyricFont && chordFont) {
      let isMounted = true;
      const raf = requestAnimationFrame(() => {
        if (isMounted) {
          setLayoutReady(true);
          onLoaded?.();
        }
      });
      return () => {
        isMounted = false;
        cancelAnimationFrame(raf);
      };
    }
  }, [layoutData, musicFont, lyricFont, chordFont]);

  if (!layoutData || !musicFont || !lyricFont || !chordFont || canvasWidth <= 0) {
    return null;
  }

  return (
    <Canvas
      style={{
        width: canvasWidth,
        height: layoutData.canvasHeight,
        marginLeft: marginLeft,
        marginRight: marginRight,
        opacity: layoutReady ? 1 : 0
      }}
    >
      <Group transform={[{ scale: currentZoom }]} origin={{ x: 0, y: 0 }}>
        <Path path={layoutData.staffPath} color="#444" style="stroke" strokeWidth={1} />

        {layoutData.positions.map((item, index) => (
          <React.Fragment key={index}>
            {showChords && item.chord ? (
              <Group
                transform={[{ scale: currentMelodyScale }]}
                origin={{ x: item.xChord, y: item.y - (85 * currentMelodyScale) }}
              >
                <Text
                  x={item.xChord}
                  y={item.y - (45 * currentMelodyScale)}
                  text={item.chord}
                  font={chordFont}
                  color="#222"
                />
              </Group>
            ) : null}

            <Group
              transform={[{ scale: currentMelodyScale }]}
              origin={{ x: item.xNote, y: item.y }}
            >
              <Text x={item.xNote} y={item.y} text={item.char} font={musicFont} color="#222" />
            </Group>

            {item.lyric ? (
              <Text
                x={item.xLyric}
                y={item.y + 30}
                text={item.lyric}
                font={lyricFont}
                color="#000"
              />
            ) : null}

            {item.dashX ? (
              <Text
                x={item.dashX}
                y={item.y + 30}
                text="-"
                font={lyricFont}
                color="#000"
              />
            ) : null}
          </React.Fragment>
        ))}
      </Group>
    </Canvas>
  );
};

export default SkiaMelodyView;