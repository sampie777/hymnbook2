import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, StyleSheet } from "react-native";
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

interface ContentVerseProps {
  verse: Verse;
  scale: Animated.Value;
  melodyScale: Animated.Value;
  selectedVerses: Array<Verse>;
  activeMelody?: AbcMelody;
  setIsMelodyLoading: (value: boolean) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
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
  const [isMelodyLoaded, setIsMelodyLoaded] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textLineWidth, setTextLineWidth] = useState<{ text: string, width: number }[]>([]);
  const [content, setContent] = useState(verse.content);

  const styles = createStyles(useTheme());
  const animatedStyle = {
    container: {
      paddingTop: Animated.multiply(scale, 10),
      paddingBottom: Animated.multiply(scale, 35)
    },
    title: {
      fontSize: Animated.multiply(scale, 19),
      paddingBottom: Animated.multiply(scale, 5)
    },
    titleLarge: {
      fontSize: Animated.multiply(scale, 30),
      paddingBottom: Animated.multiply(scale, 5)
    },
    text: {
      fontSize: Animated.multiply(scale, 20),
      lineHeight: Animated.multiply(scale, 30)
    }
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
    }
  }, [activeMelody?.id]);

  const onMelodyLoaded = () => {
    setIsMelodyLoading(false);
    setIsMelodyLoaded(true);
  };

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

  return <Animated.View style={[styles.container, animatedStyle.container]} onLayout={onLayout}>
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

    {!isMelodyAvailable() ? undefined : <MelodyView onLoaded={onMelodyLoaded}
                                                    abc={memoizedAbc}
                                                    animatedScale={scale}
                                                    melodyScale={melodyScale} />}
  </Animated.View>;
};

export default ContentVerse;

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
