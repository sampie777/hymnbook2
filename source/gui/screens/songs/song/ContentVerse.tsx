import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Verse } from "../../../../logic/db/models/songs/Songs";
import { AbcMelody } from "../../../../logic/db/models/songs/AbcMelodies";
import Settings from "../../../../settings";
import { ABC } from "../../../../logic/songs/abc/abc";
import { isVerseInList } from "../../../../logic/songs/versePicker";
import { generateVerseContentWithCorrectWidth, getVerseType, VerseType } from "../../../../logic/songs/utils";
import { SongProcessor } from "../../../../logic/songs/songProcessor";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import MelodyView from "../../../components/melody/MelodyView";
import { NativeSyntheticEvent, TextLayoutEventData } from "react-native/Libraries/Types/CoreEventTypes";
import { renderTextWithCustomReplacements } from "../../../components/utils";
import { runAsync } from "../../../../logic/utils";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface ContentVerseProps {
  verse: Verse;
  scale: SharedValue<number>;
  melodyScale: SharedValue<number>;
  selectedVerses: Array<Verse>;
  activeMelody?: AbcMelody;
  setIsMelodyLoading: (value: boolean) => void;
  onLayout?: (verse: Verse, event: LayoutChangeEvent) => void;
  highlightText?: string;
}

const ContentVerse: React.FC<ContentVerseProps> = ({
                                                     verse,
                                                     scale,
                                                     melodyScale,
                                                     selectedVerses,
                                                     activeMelody,
                                                     setIsMelodyLoading,
                                                     onLayout,
                                                     highlightText
                                                   }) => {
  const isSelected = isVerseInList(selectedVerses, verse);
  const [showMelody, setShowMelody] = useState(false);
  const [isMelodyLoaded, setIsMelodyLoaded] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textLineWidth, setTextLineWidth] = useState<{ text: string, width: number }[]>([]);
  const [content, setContent] = useState(verse.content);

  const styles = createStyles(useTheme());
  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      paddingTop: scale.value * 10,
      paddingBottom: scale.value * 35
    })),
    title: useAnimatedStyle(() => ({
      fontSize: scale.value * 19,
      paddingBottom: scale.value * 5
    })),
    titleLarge: useAnimatedStyle(() => ({
      fontSize: scale.value * 30,
      paddingBottom: scale.value * 5
    })),
    text: useAnimatedStyle(() => ({
      fontSize: scale.value * 20,
      lineHeight: scale.value * 30,
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

  const specificStyleForTitle = () => {
    if (selectedVerses.length === 0) {
      return Settings.coloredVerseTitles ? styles.titleColoredNoSelection : styles.titleNoSelection;
    } else if (isSelected) {
      return Settings.coloredVerseTitles ? styles.titleColoredSelected : styles.titleSelected;
    }
    return Settings.coloredVerseTitles ? styles.titleColoredNotSelected : styles.titleNotSelected;
  };

  const isMelodyAvailable = () => Boolean(activeMelody !== undefined && verse.abcLyrics);

  useEffect(() => {
    setIsMelodyLoaded(false);
    if (activeMelody !== undefined) {
      setIsMelodyLoading(isMelodyAvailable());
      runAsync(() => setShowMelody(true));
    } else {
      setShowMelody(false)
    }
  }, [activeMelody?.id]);

  const onMelodyLoaded = useCallback(() => {
    setIsMelodyLoading(false);
    setIsMelodyLoaded(true);
  }, []);

  const hasCalculatedLineWidths = useRef<boolean>(false);
  useEffect(() => {
    if (hasCalculatedLineWidths.current) return;
    if (containerWidth == 0) return;
    if (textLineWidth.length == 0) return;

    setContent(generateVerseContentWithCorrectWidth(verse.content, containerWidth, textLineWidth));
    hasCalculatedLineWidths.current = true;
  }, [containerWidth, textLineWidth]);

  // Shorten name
  const displayName = SongProcessor.verseShortName(verse);

  const createHighlightedTextComponent = (text: string, index: number) =>
    <Animated.Text key={index}
                   style={styles.textHighlighted}
                   selectable={Settings.enableTextSelection}>
      {text}
    </Animated.Text>;

  const memoizedAbc = useMemo(() => ABC.generateAbcForVerse(verse, activeMelody), [activeMelody?.id]);

  const onTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) =>
    setTextLineWidth(e.nativeEvent.lines.map(it => ({
      text: it.text,
      width: it.width,
    })));

  const onTextContainerLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  return <Animated.View style={[styles.container, animatedStyle.container]} onLayout={e => onLayout?.(verse, e)}>
    {displayName.length === 0 ? undefined :
      <Animated.Text style={[
        styles.title,
        specificStyleForTitle(),
        animatedStyle.title,
        styleForVerseType(getVerseType(verse))
      ]}>
        {displayName}
      </Animated.Text>
    }

    {isMelodyLoaded && isMelodyAvailable() ? undefined :
      <Animated.Text style={[styles.text, animatedStyle.text]}
                     selectable={Settings.enableTextSelection}
                     onLayout={onTextContainerLayout}
                     onTextLayout={onTextLayout}
                     textBreakStrategy={"balanced"}>
        {highlightText == null
          ? content
          : renderTextWithCustomReplacements(content, highlightText, createHighlightedTextComponent)}
      </Animated.Text>
    }

    {!(showMelody && isMelodyAvailable()) ? undefined :
      <View style={{
        // Hide view while melody is loading. Do this outside the MelodyView component to avoid re-renders
        position: isMelodyLoaded ? "relative" : "absolute",
        opacity: isMelodyLoaded ? 1 : 0
      }}>
        <MelodyView
          onLoaded={onMelodyLoaded}
          abc={memoizedAbc}
          // abc={"a b c d e f g A B C D E F G | A A2 A3 A4 A5 A6 A7 A8 A9 A10 | z z2 z3 z4 z5 z6 z7 z8 |]\nw: abc def ghi"}
          animatedScale={scale}
          melodyScale={melodyScale}
        />
      </View>
    }
  </Animated.View>;
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

  text: {
    color: colors.text.default,
  },
  textHighlighted: {
    color: colors.text.highlighted.foreground,
    backgroundColor: colors.text.highlighted.background
  }
});
