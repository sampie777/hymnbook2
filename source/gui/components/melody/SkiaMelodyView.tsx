import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, Group, Path, Text, useFont } from "@shopify/react-native-skia";
import { runOnJS, SharedValue, useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { AbcSong } from "@hymnbook/abc";
import { AbcConfig } from "./config";
import { MelodyTextAlignment } from "../../../logic/songs/abc/utils.ts";
import { isAndroid, isDevelopmentEnv } from "../../../logic/utils/utils.ts";
import { useTheme } from "../providers/ThemeProvider.tsx";
import { PixelRatio, Platform } from "react-native";
import {
  balanceRows,
  computeLayout,
  createClefItem,
  extractScoreLines,
  measureScoreLines
} from "./skiaMelodyLayout.ts";

const ANDROID_MUSIC_SCALE = Platform.OS === "android" ? 1.17 : 1;
const ANDROID_MUSIC_Y_OFFSET = Platform.OS === "android" ? -0.1 : 0;

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

const useZoomThrottler = (animatedScale: SharedValue<number>, melodyScale: SharedValue<number>) => {
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

  return { currentZoom, currentMelodyScale };
};

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
  const { colors } = useTheme();
  const canvasWidth = availableWidth - marginLeft - marginRight;
  const [layoutReady, setLayoutReady] = useState(false);

  const { currentZoom, currentMelodyScale } = useZoomThrottler(animatedScale, melodyScale);

  useEffect(() => {
    setLayoutReady(false);
  }, [abcSong, showMelodyOnSeparateLines, canvasWidth]);

  const fontScale = PixelRatio.getFontScale();
  const musicFont = useFont(require("../../../../assets/fonts/MusiQwikCustom.ttf"), AbcConfig.noteSize * fontScale * ANDROID_MUSIC_SCALE);
  const lyricFont = useFont(require("../../../../assets/fonts/Roboto-Regular.ttf"), AbcConfig.textSize * fontScale);
  const chordFont = useFont(require("../../../../assets/fonts/Roboto-Regular.ttf"), AbcConfig.chordSize * fontScale);

  const clefItem = useMemo(() => createClefItem(abcSong), [abcSong?.clef?.type]);

  const rawScoreLines = useMemo(() => {
    return extractScoreLines(abcSong, clefItem, showMelodyOnSeparateLines);
  }, [abcSong, clefItem, showMelodyOnSeparateLines]);

  const layoutData = useMemo(() => {
    if (!musicFont || !lyricFont || !chordFont || canvasWidth <= 0 || rawScoreLines.length === 0) return null;

    const effectiveWidth = Math.max((canvasWidth / currentZoom) - 20, 50);

    const measuredPhrases = measureScoreLines(rawScoreLines, musicFont, lyricFont, chordFont, currentMelodyScale, showChords);
    const balancedRows = balanceRows(measuredPhrases, effectiveWidth, currentMelodyScale, textAlignment, clefItem);

    if (balancedRows.length === 0) return null;

    const { positions, staffPath, maxBottomY } = computeLayout(
      balancedRows,
      effectiveWidth,
      currentMelodyScale,
      showChords,
      textAlignment,
      clefItem,
      lyricFont
    );

    let totalScaledHeight = maxBottomY * currentZoom;

    // Limit to 2730 for simulator on macos as a higher value will crash the app
    if (isDevelopmentEnv && !isAndroid) totalScaledHeight = Math.min(totalScaledHeight, 2730);

    return {
      positions,
      staffPath,
      canvasHeight: totalScaledHeight
    };
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
        <Path path={layoutData.staffPath} color={colors.notes.lines as string} style="stroke" strokeWidth={1} />

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
                  color={colors.text.default as string}
                />
              </Group>
            ) : null}

            <Group
              transform={[{ scale: currentMelodyScale }]}
              origin={{ x: item.xNote, y: item.y }}
            >
              <Text
                x={item.xNote}
                y={item.y + 0.4 + ANDROID_MUSIC_Y_OFFSET}
                text={item.char}
                font={musicFont}
                color={colors.notes.color as string}
              />
            </Group>

            {item.lyric ? (
              <Text
                x={item.xLyric}
                y={item.y + item.lyricOffsetY}
                text={item.lyric}
                font={lyricFont}
                color={colors.text.default as string}
              />
            ) : null}

            {item.dashX ? (
              <Text
                x={item.dashX}
                y={item.y + item.lyricOffsetY}
                text="-"
                font={lyricFont}
                color={colors.text.default as string}
              />
            ) : null}
          </React.Fragment>
        ))}
      </Group>
    </Canvas>
  );
};

export default SkiaMelodyView;