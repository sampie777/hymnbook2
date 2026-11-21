import React, { memo, useCallback, useRef } from "react";
import { LayoutChangeEvent, StyleSheet } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Verse } from "../../../../logic/db/models/songs/Songs";
import Settings from "../../../../settings";
import { isVerseInList } from "../../../../logic/songs/versePicker";
import { getVerseType, VerseType } from "../../../../logic/songs/utils";
import { SongProcessor } from "../../../../logic/songs/songProcessor";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { NativeSyntheticEvent, TextLayoutEventData } from "react-native/Libraries/Types/CoreEventTypes";
import { renderTextWithCustomReplacements } from "../../../components/utils";
import { AnimatedSafeText } from "../../../components/SafeText";
import { isAndroid } from "../../../../logic/utils/utils.ts";

interface SongTextVersesProps {
  verses: Verse[];
  scale: SharedValue<number>;
  selectedVerses: Verse[];
  highlightText?: string;
  onVerseOffset?: (verse: Verse, y: number) => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

const SongTextVerses: React.FC<SongTextVersesProps> = ({
                                                         verses,
                                                         scale,
                                                         selectedVerses,
                                                         highlightText,
                                                         onVerseOffset,
                                                         onLayout,
                                                       }) => {
  const styles = createStyles(useTheme());
  const containerYRef = useRef(0);
  const relativeOffsetsRef = useRef<Map<number, number>>(new Map());
  const paddingTopBetweenVerses = 0;

  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      paddingTop: scale.value * paddingTopBetweenVerses,
      paddingBottom: scale.value * (isAndroid ? 34.5 : 40)
    })),
    title: useAnimatedStyle(() => ({
      fontSize: scale.value * 19,
      lineHeight: scale.value * 28,
    })),
    titleLarge: useAnimatedStyle(() => ({
      fontSize: scale.value * 30,
      lineHeight: scale.value * 40,
    })),
    text: useAnimatedStyle(() => ({
      fontSize: scale.value * 20,
      lineHeight: scale.value * 28,
    })),
    verseSpacer: useAnimatedStyle(() => ({
      lineHeight: scale.value * 20,
    }))
  };

  const styleForVerseType = (type: VerseType) => {
    switch (type) {
      case VerseType.Verse:
        return animatedStyle.titleLarge;
      default:
        return styles.titleNoSelection;
    }
  };

  const specificStyleForTitle = (verse: Verse, isSelected: boolean) => {
    if (selectedVerses.length === 0) {
      return Settings.coloredVerseTitles ? styles.titleColoredNoSelection : styles.titleNoSelection;
    } else if (isSelected) {
      return Settings.coloredVerseTitles ? styles.titleColoredSelected : styles.titleSelected;
    }
    return Settings.coloredVerseTitles ? styles.titleColoredNotSelected : styles.titleNotSelected;
  };

  const createHighlightedTextComponent = (text: string, index: number) => (
    <AnimatedSafeText key={index} style={styles.textHighlighted}>
      {text}
    </AnimatedSafeText>
  );

  const notifyVerseOffsets = (containerY: number) => {
    if (!onVerseOffset) return;
    const paddingTop = scale.value * paddingTopBetweenVerses;
    verses.forEach((verse) => {
      const relY = relativeOffsetsRef.current.get(verse.index);
      if (relY !== undefined) {
        onVerseOffset(verse, containerY + paddingTop + relY);
      }
    });
  };

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const newY = e.nativeEvent.layout.y;
    const yChanged = containerYRef.current !== newY;
    containerYRef.current = newY;
    onLayout?.(e);

    if (yChanged && relativeOffsetsRef.current.size > 0) {
      notifyVerseOffsets(newY);
    }
  };

  const onTextLayout = useCallback((e: NativeSyntheticEvent<TextLayoutEventData>) => {
    if (verses.length === 0) return;
    const lines = e.nativeEvent.lines;
    if (!lines || lines.length === 0) return;

    const newRelativeOffsets = new Map<number, number>();
    let lineCursor = 0;
    verses.forEach((verse, idx) => {
      if (idx === 0) {
        newRelativeOffsets.set(verse.index, 0);
      }
      const displayName = SongProcessor.verseShortName(verse);
      const matchPrefix = displayName.length > 0 ? displayName : verse.content.split("\n")[0].trim().slice(0, 10);

      while (lineCursor < lines.length) {
        const line = lines[lineCursor];
        if (line.text.trim().startsWith(matchPrefix)) {
          newRelativeOffsets.set(verse.index, line.y);
          lineCursor++;
          break;
        }
        lineCursor++;
      }

      if (!newRelativeOffsets.has(verse.index) && idx > 0) {
        const prevRelY = newRelativeOffsets.get(verses[idx - 1].index) ?? 0;
        newRelativeOffsets.set(verse.index, prevRelY + 50);
      }
    });

    relativeOffsetsRef.current = newRelativeOffsets;
    notifyVerseOffsets(containerYRef.current);
  }, [verses, onVerseOffset, scale]);

  return (
    <Animated.View
      style={[styles.container, animatedStyle.container]}
      onLayout={handleContainerLayout}
    >
      <AnimatedSafeText
        selectable={Settings.enableTextSelection}
        onTextLayout={onTextLayout}
        textBreakStrategy="balanced"
      >
        {verses.map((verse, index) => {
          const isSelected = isVerseInList(selectedVerses, verse);
          const displayName = SongProcessor.verseShortName(verse);
          const isLastVerse = index === verses.length - 1;

          return (
            <React.Fragment key={verse.id.toString()}>
              {displayName.length === 0 ? null : (
                <AnimatedSafeText
                  style={[
                    styles.title,
                    specificStyleForTitle(verse, isSelected),
                    animatedStyle.title,
                    styleForVerseType(getVerseType(verse))
                  ]}
                >
                  {displayName + "\n"}
                </AnimatedSafeText>
              )}

              <AnimatedSafeText style={[styles.text, animatedStyle.text]}>
                {highlightText == null
                  ? verse.content
                  : renderTextWithCustomReplacements(
                    verse.content,
                    highlightText,
                    createHighlightedTextComponent
                  )}
              </AnimatedSafeText>

              {isLastVerse ? null : (
                <AnimatedSafeText style={[ animatedStyle.verseSpacer]}>
                  {"\n\n\n"}
                </AnimatedSafeText>
              )}
            </React.Fragment>
          );
        })}
      </AnimatedSafeText>
    </Animated.View>
  );
};

export default memo(SongTextVerses);

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

  text: {
    color: colors.text.default,
  },
  textHighlighted: {
    color: colors.text.highlighted.foreground,
    backgroundColor: colors.text.highlighted.background
  }
});
