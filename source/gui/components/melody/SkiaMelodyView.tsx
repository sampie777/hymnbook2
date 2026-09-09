import React, { useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager } from "react-native";
import { Canvas, Group, Path, Skia, Text, useFont } from "@shopify/react-native-skia";
import { runOnJS, SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { AbcSong, VoiceItem } from "@hymnbook/abc";
import { AbcConfig } from "./config";
import {
  getNoteAccidental,
  getNoteChar,
  getNoteDot,
  getNoteLyrics,
  getNoteRest
} from "../../../logic/songs/abc/utils.ts";
import { isDevelopmentEnv } from "../../../logic/utils/utils.ts";

enum Alignment {
  Left,
  Center,
  Right
}

interface PositionItem {
  char: string;
  lyric: string;
  chord: string;
  isEndBar: boolean;
  y: number;
  xNote: number;
  xLyric: number;
  xChord: number;
}

interface Props {
  abcSong: AbcSong;
  animatedScale: SharedValue<number>;
  melodyScale: SharedValue<number>;
  showChords: boolean;
  availableWidth: number;
  marginLeft?: number;
  marginRight?: number;
  onLoaded?: () => void;
}

const SkiaMelodyView: React.FC<Props> = ({
                                           abcSong,
                                           animatedScale,
                                           melodyScale,
                                           showChords,
                                           availableWidth,
                                           marginLeft = 0,
                                           marginRight = 0,
                                           onLoaded,
                                         }) => {
  const canvasWidth = availableWidth - marginLeft - marginRight;

  const [activeScale, setActiveScale] = useState(animatedScale.value * melodyScale.value);
  const [layoutReady, setLayoutReady] = useState(false);
  const lastReportedScale = useSharedValue(activeScale);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safely updates the React state and queues a final precise sync
  const throttledUpdate = (scale: number) => {
    setActiveScale(scale);

    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);

    // Ensure the final exact scale is caught when the user stops pinching
    settleTimeoutRef.current = setTimeout(() => {
      setActiveScale(animatedScale.value * melodyScale.value);
    }, 150);
  };

  // Sync Reanimated shared value to JS state during the gesture with throttling
  useAnimatedReaction(
    () => animatedScale.value * melodyScale.value,
    (currentScale) => {
      // Only resize the native canvas if the zoom changed by more than 2.5%
      // This prevents the Metal texture allocation crash in the iOS Simulator
      if (Math.abs(currentScale - lastReportedScale.value) > 0.025) {
        lastReportedScale.value = currentScale;
        runOnJS(throttledUpdate)(currentScale);
      }
    },
    [animatedScale, melodyScale]
  );

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    };
  }, []);

  // Reset layoutReady whenever the input song or verse melody changes
  useEffect(() => {
    setLayoutReady(false);
  }, [abcSong]);

  const musicFont = useFont(require("../../../../assets/fonts/MusiQwikCustom.ttf"), AbcConfig.noteSize);
  const lyricFont = useFont(require("../../../../assets/fonts/Roboto-Regular.ttf"), AbcConfig.textSize);

  const flatScore = useMemo(() => {
    if (abcSong == null) return [];

    const items: Array<{ char: string, lyric: string, chord: string, isEndBar: boolean }> = [];
    items.push({ char: abcSong.clef.type !== "bass" ? " &" : " 0", lyric: "", chord: "", isEndBar: false });

    abcSong.melody.flat().forEach((item: VoiceItem) => {
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

      items.push({ char: note, lyric, chord, isEndBar });
    });

    return items;
  }, [abcSong]);

  const layoutData = useMemo(() => {
    if (!musicFont || !lyricFont || canvasWidth <= 0 || flatScore.length == 0) return null;

    const path = Skia.Path.Make();
    const positions: PositionItem[] = [];

    const lineHeight = 100 + (showChords ? 30 : 0);
    // Calculate the virtual width available for music based on the current zoom level and 20px padding (10px each side)
    // Prevent effectiveWidth from becoming impossibly small when zoomed in
    const effectiveWidth = Math.max((canvasWidth / activeScale) - 20, 150);

    let currentX = 10;
    let currentY = lineHeight - 50;

    let prevWordDashed = false;
    const wordSpacing = 16;

    // 2. Track where the staff lines should dynamically end
    let lineEndX = effectiveWidth + 10;

    const clefWidth = musicFont.measureText(flatScore[0].char).width;
    const lineStartX = 10 + clefWidth + 8;

    for (let i = 0; i < flatScore.length; i++) {
      const item = flatScore[i];

      const noteWidth = musicFont.measureText(item.char).width;
      const lyricWidth = item.lyric ? lyricFont.measureText(item.lyric).width : 0;
      const chordWidth = showChords && item.chord ? lyricFont.measureText(item.chord).width : 0;

      // The raw width of the content elements
      const contentWidth = Math.max(noteWidth, lyricWidth, chordWidth);
      // The total allocated width for this item cell
      const itemWidth = contentWidth + wordSpacing;

      // Wrap Guard: Only wrap if we have already placed at least one note on this line
      if (currentX + itemWidth > effectiveWidth && currentX > lineStartX) {
        for (let j = 0; j < 5; j++) {
          const lineOffset = currentY - (j * 10) + 0.7;
          path.moveTo(10, lineOffset);
          // 3. Draw lines using the calculated end X coordinate
          path.lineTo(lineEndX, lineOffset);
        }

        currentX = 10;
        currentY += lineHeight;

        // Reset line end for the new line
        lineEndX = effectiveWidth + 10;
      }

      let align = Alignment.Center;

      if (item.lyric) {
        const trimmedLyric = item.lyric.trim();
        const currDashed = trimmedLyric.endsWith("-");

        // 4. State machine using the new enum
        if (currDashed && !prevWordDashed) {
          align = Alignment.Right;
        } else if (currDashed && prevWordDashed) {
          align = Alignment.Center;
        } else if (!currDashed && prevWordDashed) {
          align = Alignment.Left;
        } else {
          align = Alignment.Center;
        }

        prevWordDashed = currDashed;
      } else {
        prevWordDashed = false;
      }

      let contentStartX: number;
      if (align === Alignment.Right) {
        contentStartX = currentX + wordSpacing;
      } else if (align === Alignment.Left) {
        contentStartX = currentX;
      } else {
        contentStartX = currentX + (wordSpacing / 2);
      }

      const centerX = contentStartX + (contentWidth / 2);

      const xNote = centerX - (noteWidth / 2);

      positions.push({
        ...item,
        y: currentY,
        xNote,
        xLyric: centerX - (lyricWidth / 2),
        xChord: centerX - (chordWidth / 2),
      });

      // 5. If this is the end of the song/section, cap the staff lines to the edge of the bar
      if (item.isEndBar) {
        lineEndX = xNote + noteWidth - 2;
      } else {
        lineEndX = effectiveWidth + 10;
      }

      currentX += itemWidth;
    }

    // Draw the final trailing staff lines using the tracked end point
    for (let j = 0; j < 5; j++) {
      const lineOffset = currentY - (j * 10) + 0.7;
      path.moveTo(10, lineOffset);
      path.lineTo(lineEndX, lineOffset);
    }

    let totalScaledHeight = (currentY + 60) * activeScale;
    // 3. The Texture Limit: iOS simulator crash if a texture exceeds 2730px.
    if (isDevelopmentEnv) totalScaledHeight = Math.min(totalScaledHeight, 2730);

    return { positions, staffPath: path, canvasHeight: totalScaledHeight };
  }, [flatScore, activeScale, canvasWidth, musicFont, lyricFont, showChords]);

  useEffect(() => {
    if (layoutData && musicFont && lyricFont) {
      const task = InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          setLayoutReady(true);
          onLoaded?.();
        });
      });
      return () => task.cancel();
    }
  }, [layoutData, musicFont, lyricFont]);

  if (!layoutData || !musicFont || !lyricFont || canvasWidth <= 0) {
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
      <Group transform={[{ scale: activeScale }]} origin={{ x: 0, y: 0 }}>
        <Path path={layoutData.staffPath} color="#444" style="stroke" strokeWidth={1} />

        {layoutData.positions.map((item, index) => (
          <React.Fragment key={index}>
            {showChords && item.chord ? (
              <Text x={item.xChord} y={item.y - 55} text={item.chord} font={lyricFont} color="#222" />
            ) : null}

            <Text x={item.xNote} y={item.y} text={item.char} font={musicFont} color="#222" />

            {item.lyric ? (
              <Text x={item.xLyric} y={item.y + 35} text={item.lyric} font={lyricFont} color="#000" />
            ) : null}
          </React.Fragment>
        ))}
      </Group>
    </Canvas>
  );
};

export default SkiaMelodyView;