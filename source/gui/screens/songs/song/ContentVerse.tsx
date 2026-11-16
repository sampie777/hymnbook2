import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Verse } from "../../../../logic/db/models/songs/Songs";
import { AbcMelody } from "../../../../logic/db/models/songs/AbcMelodies";
import Settings from "../../../../settings";
import * as ABC from "@hymnbook/abc";
import { isVerseInList } from "../../../../logic/songs/versePicker";
import { getVerseType, VerseType } from "../../../../logic/songs/utils";
import { SongProcessor } from "../../../../logic/songs/songProcessor";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { AnimatedSafeText } from "../../../components/SafeText.tsx";
import SkiaMelodyView from "../../../components/melody/SkiaMelodyView.tsx";
import { MelodyTextAlignment } from "../../../../logic/songs/abc/utils.ts";

interface ContentVerseProps {
  verse: Verse;
  scale: SharedValue<number>;
  melodyScale: SharedValue<number>;
  selectedVerses: Array<Verse>;
  activeMelody?: AbcMelody;
  setIsMelodyLoading?: (value: boolean) => void;
  onLayout?: (verse: Verse, event: LayoutChangeEvent) => void;
  highlightText?: string;
  showMelodyOnSeparateLines: boolean;
  showMelodyChords: boolean;
  melodyTextAlignment: MelodyTextAlignment;
  availableWidth?: number;
  onMelodyReady?: () => void;
}

const ContentVerse: React.FC<ContentVerseProps> = ({
  verse,
  scale,
  melodyScale,
  selectedVerses,
  activeMelody,
  setIsMelodyLoading,
  onLayout,
  showMelodyOnSeparateLines,
  showMelodyChords,
  melodyTextAlignment,
  availableWidth,
  onMelodyReady,
}) => {
  const isSelected = isVerseInList(selectedVerses, verse);
  const [containerWidth, setContainerWidth] = useState(availableWidth || 0);
  const effectiveWidth = (availableWidth && availableWidth > 0) ? availableWidth : containerWidth;

  const displayName = SongProcessor.verseShortName(verse);
  const isMelodyAvailable = Boolean(activeMelody !== undefined && verse.abcLyrics);

  const styles = createStyles(useTheme());
  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      paddingTop: scale.value * 10,
      paddingBottom: scale.value * 35
    })),
    title: useAnimatedStyle(() => ({
      fontSize: scale.value * 19,
      paddingBottom: 0
    })),
    titleLarge: useAnimatedStyle(() => ({
      fontSize: scale.value * 30,
      paddingBottom: 0
    })),
  };

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

  const onMelodyLoaded = useCallback(() => {
    setIsMelodyLoading?.(false);
    onMelodyReady?.();
  }, [setIsMelodyLoading, onMelodyReady]);

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

      {effectiveWidth > 0 && (
        <SkiaMelodyView
          onLoaded={onMelodyLoaded}
          key={`${verse.id}_${activeMelody?.id}_${Math.round(effectiveWidth)}`}
          abcSong={memoizedAbc}
          animatedScale={scale}
          melodyScale={melodyScale}
          showMelodyOnSeparateLines={showMelodyOnSeparateLines}
          showChords={showMelodyChords}
          availableWidth={effectiveWidth}
          marginLeft={-20}
          marginRight={-10}
          textAlignment={melodyTextAlignment}
        />
      )}
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
});
