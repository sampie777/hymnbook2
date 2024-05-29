import React, { useEffect, useMemo, useState } from "react";
import { Animated, LayoutChangeEvent, StyleSheet, Text } from "react-native";
import { Verse } from "../../../../logic/db/models/Songs";
import { AbcMelody } from "../../../../logic/db/models/AbcMelodies";
import Settings from "../../../../settings";
import { ABC } from "../../../../logic/songs/abc/abc";
import { isVerseInList } from "../../../../logic/songs/versePicker";
import { getVerseType, VerseType } from "../../../../logic/songs/utils";
import { SongProcessor } from "../../../../logic/songs/songProcessor";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { renderTextWithCustomReplacements } from "../../../components/utils";
import MelodyView from "../../../components/melody/MelodyView";
import { NativeSyntheticEvent, TextLayoutEventData } from "react-native/Libraries/Types/CoreEventTypes";
import { rollbar } from "../../../../logic/rollbar";

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

  const styles = createStyles(useTheme());
  const animatedStyle = {
    container: {
      paddingTop: Animated.multiply(scale, 10),
      paddingBottom: Animated.multiply(scale, 35)
    },
    title: {
      fontSize: Settings.debug_useAnimatedTextComponentForVerse ? Animated.multiply(scale, 19) : 19,
      paddingBottom: Settings.debug_useAnimatedTextComponentForVerse ? Animated.multiply(scale, 5) : 5
    },
    titleLarge: {
      fontSize: Settings.debug_useAnimatedTextComponentForVerse ? Animated.multiply(scale, 30) : 30,
      paddingBottom: Settings.debug_useAnimatedTextComponentForVerse ? Animated.multiply(scale, 5) : 5
    },
    text: {
      fontSize: Settings.debug_useAnimatedTextComponentForVerse ? Animated.multiply(scale, 20) : 20,
      lineHeight: Settings.debug_useAnimatedTextComponentForVerse ? Animated.multiply(scale, 30) : 30
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

  // Shorten name
  const displayName = SongProcessor.verseShortName(verse);

  const createHighlightedTextComponent = (text: string, index: number) =>
    <Animated.Text key={index}
                   style={styles.textHighlighted}
                   selectable={Settings.enableTextSelection}>
      {text}
    </Animated.Text>;

  const memoizedAbc = useMemo(() => ABC.generateAbcForVerse(verse, activeMelody), [activeMelody?.id]);

  const renderContent = () => {
    if (highlightText != null) {
      return renderTextWithCustomReplacements(verse.content, highlightText, createHighlightedTextComponent);
    }

    const content = Settings.debug_addWhitespaceAfterEachVerseLine ? verse.content.replace(/\n/g, " \n") : verse.content;
    const TextComponent = Settings.debug_useAnimatedTextComponentForExtraComponents ? Animated.Text : Text;
    let resultComponent = <>{content}</>;

    if (Settings.debug_renderEachVerseLineAsTextComponent) {
      resultComponent = <>{
        content
          .split("\n")
          .map((it, i) => <TextComponent key={i + it}>{i > 0 ? "\n" : ""}{it}</TextComponent>)
      }</>;
    }

    if (Settings.debug_addWhitespacesAfterVerse) {
      resultComponent = <>{resultComponent}<TextComponent>{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}</TextComponent></>;
    }

    if (Settings.debug_addInvisibleCharactersAfterVerse) {
      resultComponent = <>{resultComponent}<TextComponent>{"‎"}{"‎"}{"‎"}{"‎"}{"‎"}{"‎"}{"‎"}{"‎"}{"‎"}{"‎"}</TextComponent></>;
    }

    if (Settings.debug_addInvisibleTextAfterVerse) {
      resultComponent = <>{resultComponent}<TextComponent style={{ color: "#fff0" }}> . . . . . . . . . .</TextComponent></>;
    }

    return resultComponent;
  };

  const onTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    rollbar.debug("onTextLayout", {
      verse: verse,
      event: e,
      lines: JSON.stringify(e.nativeEvent.lines),
      songs: verse._songs ? verse._songs[0].name : undefined
    });
  };

  const MainTextComponent = Settings.debug_useAnimatedTextComponentForVerse ? Animated.Text : Text;

  return <Animated.View style={[styles.container, animatedStyle.container]} onLayout={onLayout}>
    {displayName.length === 0 ? undefined :
      <MainTextComponent style={[
        styles.title,
        specificStyleForTitle(),
        animatedStyle.title,
        styleForVerseType(getVerseType(verse))
      ]}>
        {displayName}
      </MainTextComponent>
    }

    {!Settings.debug_ignoreShowMelody && isMelodyLoaded && isMelodyAvailable() ? undefined :
      /* @ts-ignore */
      <MainTextComponent
        style={[styles.text, animatedStyle.text]}
        selectable={Settings.enableTextSelection}
        textBreakStrategy={"balanced"}
        adjustsFontSizeToFit={Settings.debug_adjustsFontSizeToFit}
        allowFontScaling={Settings.debug_allowFontScaling}
        onTextLayout={Settings.debug_logOnTextLayout ? onTextLayout : undefined}
      >
        {renderContent()}
      </MainTextComponent>
    }

    {Settings.debug_ignoreShowMelody || !isMelodyAvailable() ? undefined :
      <MelodyView onLoaded={onMelodyLoaded}
                  abc={memoizedAbc}
                  animatedScale={scale}
                  melodyScale={melodyScale} />}
  </Animated.View>;
};

export default ContentVerse;

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderWidth: Settings.debug_drawSongVerseBorders || Settings.debug_drawSongVerseBorderContainer ? 1 : undefined,
    borderColor: Settings.debug_drawSongVerseBorderOpaque ? colors.background : "#0000",
    flex: Settings.debug_useFlexForVerses ? 1 : undefined,
    flexDirection: Settings.debug_useFlexForVersesContent ? "column" : undefined
  },
  title: {
    color: colors.verseTitle,
    textTransform: "lowercase",
    fontFamily: fontFamily.sansSerifLight,
    fontStyle: "italic",
    borderWidth: Settings.debug_drawSongVerseBorders || Settings.debug_drawSongVerseBorderTitle ? 1 : undefined,
    borderColor: Settings.debug_drawSongVerseBorderOpaque ? colors.background : "#0000",
    flex: 10
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
    borderWidth: Settings.debug_drawSongVerseBorders || Settings.debug_drawSongVerseBorderText ? 1 : undefined,
    borderColor: Settings.debug_drawSongVerseBorderOpaque ? colors.background : "#0000",
    flex: Settings.debug_useFlexForVersesContent ? 1 : undefined
  },
  textHighlighted: {
    color: colors.text.highlighted.foreground,
    backgroundColor: colors.text.highlighted.background
  }
});
