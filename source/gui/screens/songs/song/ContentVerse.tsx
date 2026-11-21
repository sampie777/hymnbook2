import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet } from "react-native";
import { Verse } from "../../../../logic/db/models/songs/Songs";
import { AbcMelody } from "../../../../logic/db/models/songs/AbcMelodies";
import Settings from "../../../../settings";
import * as ABC from "@hymnbook/abc";
import { isVerseInList } from "../../../../logic/songs/versePicker";
import { getVerseType, VerseType } from "../../../../logic/songs/utils";
import { SongProcessor } from "../../../../logic/songs/songProcessor";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import Animated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { AnimatedSafeText } from "../../../components/SafeText.tsx";
import SkiaMelodyView from "../../../components/melody/SkiaMelodyView.tsx";
import { MelodyTextAlignment } from "../../../../logic/songs/abc/utils.ts";
import { renderTextWithCustomReplacements } from "../../../components/utils";
import config from "../../../../config.ts";
import { isAndroid } from "../../../../logic/utils/utils.ts";
import { VerseStyleValues } from "./verseStyles.ts";

interface ContentVerseProps {
  verse: Verse;
  scale: SharedValue<number>;
  melodyScale: SharedValue<number>;
  selectedVerses: Array<Verse>;
  activeMelody?: AbcMelody;
  showMelody?: boolean;
  onLayout?: (verse: Verse, event: LayoutChangeEvent) => void;
  highlightText?: string;
  showMelodyOnSeparateLines: boolean;
  showMelodyChords: boolean;
  melodyTextAlignment: MelodyTextAlignment;
  availableWidth?: number;
  initialHeight?: number;
  onMelodyReady?: () => void;
  onShowStart?: () => void;
  onHideComplete?: () => void;
}

const ContentVerse: React.FC<ContentVerseProps> = ({
                                                     verse,
                                                     scale,
                                                     melodyScale,
                                                     selectedVerses,
                                                     activeMelody,
                                                     showMelody = true,
                                                     onLayout,
                                                     highlightText,
                                                     showMelodyOnSeparateLines,
                                                     showMelodyChords,
                                                     melodyTextAlignment,
                                                     availableWidth,
                                                     onMelodyReady,
                                                     onShowStart,
                                                     onHideComplete,
                                                   }) => {
  const isSelected = isVerseInList(selectedVerses, verse);
  const [containerWidth, setContainerWidth] = useState(availableWidth || 0);
  const effectiveWidth = (availableWidth && availableWidth > 0) ? availableWidth : containerWidth;

  const displayName = SongProcessor.verseShortName(verse);
  const isMelodyAvailable = Boolean(activeMelody !== undefined && verse.abcLyrics);

  const [canvasHeightState, setCanvasHeightState] = useState<number | null>(null);
  const [textHeightReady, setTextHeightReady] = useState<boolean>(false);
  const hasTextHeightRef = useRef<boolean>(false);
  const hasShownOnceRef = useRef<boolean>(false);
  const onMelodyReadyRef = useRef(onMelodyReady);
  onMelodyReadyRef.current = onMelodyReady;
  const onShowStartRef = useRef(onShowStart);
  onShowStartRef.current = onShowStart;
  const onHideCompleteRef = useRef(onHideComplete);
  onHideCompleteRef.current = onHideComplete;

  const notifyShowStart = useCallback(() => {
    onShowStartRef.current?.();
  }, []);

  const notifyHideComplete = useCallback(() => {
    onHideCompleteRef.current?.();
  }, []);

  const textHeight = useSharedValue<number | null>(null);
  const melodyHeight = useSharedValue<number | null>(null);
  const isAnimatingHeight = useSharedValue<boolean>(false);
  const transitionProgress = useSharedValue(0);

  const styles = createStyles(useTheme());
  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      paddingTop: scale.value * VerseStyleValues.container.paddingTop,
      paddingBottom: scale.value * (isAndroid ? 34 : VerseStyleValues.container.paddingBottom),
    })),
    title: useAnimatedStyle(() => ({
      fontSize: scale.value * VerseStyleValues.title.fontSize,
      lineHeight: scale.value * VerseStyleValues.title.lineHeight,
    })),
    titleLarge: useAnimatedStyle(() => ({
      fontSize: scale.value * VerseStyleValues.titleLarge.fontSize,
      lineHeight: scale.value * VerseStyleValues.titleLarge.lineHeight,
    })),
    text: useAnimatedStyle(() => ({
      fontSize: scale.value * VerseStyleValues.text.fontSize,
      lineHeight: scale.value * VerseStyleValues.text.lineHeight,
    })),
  };

  // Once both text and melody heights are known, keep melody driving natural height
  // (including while hiding, until unmount) so switching height to/from "auto" never jumps.
  const isMelodyDrivingHeight = Boolean(canvasHeightState != null && textHeightReady);

  const animatedBodyStyle = useAnimatedStyle(() => {
    if (!isAnimatingHeight.value || textHeight.value == null || melodyHeight.value == null) {
      return { height: "auto" as const };
    }
    return {
      height: textHeight.value + (melodyHeight.value - textHeight.value) * transitionProgress.value,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: 1 - transitionProgress.value,
  }));

  const animatedMelodyStyle = useAnimatedStyle(() => ({
    opacity: transitionProgress.value,
  }));

  const styleForVerseType = (type: VerseType) => {
    switch (type) {
      case VerseType.Verse:
        return animatedStyle.titleLarge;
      default:
        return styles.titleNoSelection;
    }
  };

  const specificStyleForTitle = () => {
    if (selectedVerses.length === 0) {
      return Settings.coloredVerseTitles ? styles.titleColoredNoSelection : styles.titleNoSelection;
    } else if (isSelected) {
      return Settings.coloredVerseTitles ? styles.titleColoredSelected : styles.titleSelected;
    }
    return Settings.coloredVerseTitles ? styles.titleColoredNotSelected : styles.titleNotSelected;
  };

  const handleTextLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) {
      textHeight.value = h;
      if (!hasTextHeightRef.current) {
        hasTextHeightRef.current = true;
        if (melodyHeight.value != null && !hasShownOnceRef.current) {
          isAnimatingHeight.value = true;
        }
        setTextHeightReady(true);
      }
    }
  }, [textHeight, melodyHeight, isAnimatingHeight]);

  const onMelodyLoaded = useCallback((height: number) => {
    onMelodyReadyRef.current?.();
    melodyHeight.value = height;
    if (!hasShownOnceRef.current && hasTextHeightRef.current) {
      isAnimatingHeight.value = true;
    }
    setCanvasHeightState(height);
  }, [melodyHeight, isAnimatingHeight]);

  useEffect(() => {
    if (showMelody === false) {
      if (!hasShownOnceRef.current) {
        notifyHideComplete();
        return;
      }
      hasShownOnceRef.current = false;
      isAnimatingHeight.value = true;
      transitionProgress.value = withTiming(
        0,
        {
          duration: config.songs.melody.animationDuration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished) {
            runOnJS(notifyHideComplete)();
          }
        }
      );
    } else if (showMelody === true && canvasHeightState != null && textHeightReady && !hasShownOnceRef.current) {
      hasShownOnceRef.current = true;
      isAnimatingHeight.value = true;
      transitionProgress.value = withTiming(
        1,
        {
          duration: config.songs.melody.animationDuration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished) {
            isAnimatingHeight.value = false;
          }
        }
      );
      notifyShowStart();
    }
  }, [showMelody, canvasHeightState, textHeightReady, isAnimatingHeight, transitionProgress, notifyShowStart, notifyHideComplete]);

  const memoizedAbc = useMemo(() => {
    if (!activeMelody || !verse.abcLyrics) return null;

    const abcString = ABC.generateAbcForVerse(
      verse,
      activeMelody,
      { trimLines: Settings.showMelodyOnSeparateLines }
    );
    // const abcString="X: 1\n" +
    //   "T: Cooley's\n" +
    //   "M: 4/4\n" +
    //   "L: 1/8\n" +
    //   "R: reel\n" +
    //   "K: Emin\n" +
    //   "A ^A =A A C, D, E, F, G, A, B, C D E F G A B c d e f g a b A/4 A/2 A/ A3/4 A A3/2 A2 A3 A4 A6 A8 A12\n" +
    //   "w: A ^A =A A C, D, E, F, G, A, B, C D E F G A B c d e f g a b A/4 A/2 A/ A3/4 A A3/2 A2 A3 A4 A6 A8 A12"
    if (abcString.length === 0) return null;

    return ABC.parse(abcString);
  }, [verse, activeMelody?.id, Settings.showMelodyOnSeparateLines]);

  useEffect(() => {
    if (!isMelodyAvailable || !memoizedAbc) {
      if (showMelody) {
        onMelodyReadyRef.current?.();
        notifyShowStart();
      } else {
        notifyHideComplete();
      }
    }
  }, [isMelodyAvailable, memoizedAbc, showMelody, notifyShowStart, notifyHideComplete]);

  useEffect(() => {
    if (availableWidth && availableWidth > 0 && Math.abs(availableWidth - containerWidth) > 1) {
      setContainerWidth(availableWidth);
    }
  }, [availableWidth]);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const newWidth = e.nativeEvent.layout.width;
    if (newWidth > 0 && Math.abs(newWidth - containerWidth) > 1) {
      setContainerWidth(newWidth);
    }
    onLayout?.(verse, e);
  };

  const createHighlightedTextComponent = (text: string, index: number) => (
    <AnimatedSafeText key={index} style={styles.textHighlighted}>
      {text}
    </AnimatedSafeText>
  );

  if (!isMelodyAvailable || !memoizedAbc) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, animatedStyle.container]}
      onLayout={handleContainerLayout}
    >
      {displayName.length === 0 ? null : (
        <AnimatedSafeText
          style={[
            styles.title,
            specificStyleForTitle(),
            animatedStyle.title,
            styleForVerseType(getVerseType(verse))
          ]}
        >
          {displayName}
        </AnimatedSafeText>
      )}

      <Animated.View
        style={[styles.bodyContainer, animatedBodyStyle]}
      >
        <Animated.View
          style={[
            isMelodyDrivingHeight ? styles.layerAbsolute : styles.layerRelative,
            styles.textLayer,
            animatedTextStyle
          ]}
          onLayout={handleTextLayout}
          pointerEvents={showMelody && isMelodyDrivingHeight ? "none" : "auto"}
        >
          <AnimatedSafeText
            style={[styles.text, animatedStyle.text]}
            textBreakStrategy="balanced"
          >
            {highlightText == null
              ? verse.content
              : renderTextWithCustomReplacements(verse.content, highlightText, createHighlightedTextComponent)}
          </AnimatedSafeText>
        </Animated.View>

        {effectiveWidth > 0 && (
          <Animated.View
            style={[
              isMelodyDrivingHeight ? styles.layerRelative : styles.layerAbsolute,
              animatedMelodyStyle
            ]}
            pointerEvents={showMelody && isMelodyDrivingHeight ? "auto" : "none"}
          >
            <SkiaMelodyView
              onLoaded={onMelodyLoaded}
              key={`${verse.id}_${activeMelody?.id}_${Math.round(effectiveWidth + 30)}`}
              abcSong={memoizedAbc}
              animatedScale={scale}
              melodyScale={melodyScale}
              showMelodyOnSeparateLines={showMelodyOnSeparateLines}
              showChords={showMelodyChords}
              availableWidth={effectiveWidth + 30}
              marginLeft={0}
              marginRight={0}
              textAlignment={melodyTextAlignment}
            />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

export default memo(ContentVerse);

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {},
  title: {
    color: colors.verseTitle,
    textTransform: "lowercase",
    fontFamily: fontFamily.sansSerifLight,
    fontStyle: "italic"
  },

  titleNotSelected: {},
  titleSelected: {
    fontWeight: "bold"
  },
  titleNoSelection: {},

  titleColoredNotSelected: {
    fontStyle: "normal"
  },
  titleColoredSelected: {
    fontStyle: "normal",
    color: colors.primary.default,
    fontWeight: "bold"
  },
  titleColoredNoSelection: {
    fontStyle: "normal",
    color: colors.primary.default
  },

  bodyContainer: {
    position: "relative",
    overflow: "hidden",
    marginLeft: -20,
    marginRight: -10,
  },
  layerRelative: {
    position: "relative",
    width: "100%",
  },
  layerAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  textLayer: {
    paddingLeft: 20,
    paddingRight: 10,
  },

  text: {
    color: colors.text.default,
  },
  textHighlighted: {
    color: colors.text.highlighted.foreground,
    backgroundColor: colors.text.highlighted.background
  }
});
