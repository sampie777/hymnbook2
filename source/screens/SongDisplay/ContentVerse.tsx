import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { getVerseType, VerseType } from "../../scripts/songs/utils";
import { Verse } from "../../models/Songs";
import Settings from "../../scripts/settings";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { isVerseInList } from "../../scripts/songs/versePicker";

interface ContentVerseProps {
  verse: Verse;
  scale: Animated.Value<number>;
  opacity: Animated.Value<number>;
  selectedVerses: Array<Verse>;
}

const ContentVerse: React.FC<ContentVerseProps> = ({ verse, scale, opacity, selectedVerses }) => {
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
      <Animated.Text style={[styles.text, animatedStyle.text]}>
        {verse.content}
      </Animated.Text>
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
