import React, { useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { Verse } from "../../../logic/db/models/Songs";
import { AbcMelody } from "../../../logic/db/models/AbcMelodies";
import Settings from "../../../settings";
import { ABC } from "../../../logic/songs/abc/abc";
import { isVerseInList } from "../../../logic/songs/versePicker";
import { getVerseType, VerseType } from "../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import MelodyView from "../../components/melody/MelodyView";

interface ContentVerseProps {
  verse: Verse;
  scale: Animated.Value;
  selectedVerses: Array<Verse>;
  activeMelody?: AbcMelody;
  setIsMelodyLoading: (value: boolean) => void;
}

const ContentVerse: React.FC<ContentVerseProps> = ({
                                                     verse,
                                                     scale,
                                                     selectedVerses,
                                                     activeMelody,
                                                     setIsMelodyLoading
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

  const isMelodyEnabled = () => Settings.showMelody && activeMelody !== undefined;
  const isMelodyAvailable = () => Boolean(activeMelody !== undefined && verse.abcLyrics);
  const shouldMelodyBeShownForVerse = () =>
    Settings.showMelodyForAllVerses ||
    (selectedVerses.length > 0 && selectedVerses[0].id == verse.id) ||  // Show melody because it's first selected verse
    (selectedVerses.length === 0 && verse.index === 0); // Show melody because it's first verse of song

  const displayMelody = (
    isMelodyEnabled() &&
    isMelodyAvailable() &&
    shouldMelodyBeShownForVerse()
  );

  useEffect(() => {
    setIsMelodyLoaded(false);
    if (shouldMelodyBeShownForVerse()) {
      setIsMelodyLoading(displayMelody);
    }
  }, [activeMelody?.id]);

  const onMelodyLoaded = () => {
    setIsMelodyLoading(false);
    setIsMelodyLoaded(true);
  };

  // Shorten name
  const displayName = verse.name.trim()
    .replace(/verse */gi, "");

  return (
    <Animated.View style={[styles.container, animatedStyle.container]}>
      {displayName === "" ? undefined :
        <Animated.Text style={[
          styles.title,
          specificStyleForTitle(),
          animatedStyle.title,
          styleForVerseType(getVerseType(verse))
        ]}>
          {displayName}
        </Animated.Text>
      }

      {isMelodyLoaded && displayMelody ? undefined :
        <Animated.Text style={[styles.text, animatedStyle.text]}>
          {verse.content}
        </Animated.Text>
      }

      {!displayMelody ? undefined :
        <MelodyView onLoaded={onMelodyLoaded}
                    abc={ABC.generateAbcForVerse(verse, activeMelody)}
                    animatedScale={scale} />
      }
    </Animated.View>
  );
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
    color: colors.primary,
    fontWeight: "bold"
  },
  titleColoredNoSelection: {
    fontStyle: "normal",
    color: colors.primary
  },

  text: {
    color: colors.text,
  }
});
