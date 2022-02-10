import React from "react";
import { StyleSheet } from "react-native";
import { Verse } from "../../models/Songs";
import Settings from "../../settings";
import { ABC } from "../../scripts/songs/abc/abc";
import { isVerseInList } from "../../scripts/songs/versePicker";
import { getVerseType, VerseType } from "../../scripts/songs/utils";
import Animated from "react-native-reanimated";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import MelodyView from "../../components/melody/MelodyView";

interface ContentVerseProps {
  verse: Verse;
  scale: Animated.Value<number>;
  opacity: Animated.Value<number>;
  selectedVerses: Array<Verse>;
  abcBackupMelody?: string;
}

const ContentVerse: React.FC<ContentVerseProps> = ({ verse, scale, opacity, selectedVerses, abcBackupMelody }) => {
  const isSelected = isVerseInList(selectedVerses, verse);

  const styles = createStyles(useTheme());
  const animatedStyle = {
    container: {
      marginTop: Animated.multiply(scale, 10),
      marginBottom: Animated.multiply(scale, 35),
      opacity: opacity
    },
    title: {
      fontSize: Animated.multiply(scale, 19),
      marginBottom: Animated.multiply(scale, 5)
    },
    titleLarge: {
      fontSize: Animated.multiply(scale, 30),
      marginBottom: Animated.multiply(scale, 5)
    },
    text: {
      fontSize: Animated.multiply(scale, 20),
      lineHeight: Animated.multiply(scale, 30)
    },
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

  const displayMelody = (
    (
      !(verse.abcMelody == null || verse.abcMelody.length === 0)
      || !(abcBackupMelody == null || abcBackupMelody.length === 0)
    )
    && !(verse.abcLyrics == null || verse.abcLyrics.length === 0)
  );

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

      {displayMelody ? undefined :
        <Animated.Text style={[styles.text, animatedStyle.text]}>
          {verse.content}
        </Animated.Text>
      }

      {!displayMelody ? undefined :
        <MelodyView scale={Settings.songScale}
                    abc={ABC.generateAbcForVerse(verse, abcBackupMelody)} />
      }
    </Animated.View>
  );
};

export default ContentVerse;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {},
  title: {
    color: colors.verseTitle,
    textTransform: "lowercase",
    fontFamily: "sans-serif-light",
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
    color: colors.text
  }
});
