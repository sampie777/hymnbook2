import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { getVerseType, VerseType } from "../../scripts/songs/utils";
import { Verse } from "../../models/Songs";
import Settings from "../../scripts/settings";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

interface ContentVerseProps {
  verse: Verse;
  scale: Animated.Value<number>;
  opacity: Animated.Value<number>;
}

const ContentVerse: React.FC<ContentVerseProps> = ({ verse, scale, opacity }) => {
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
        return styles.titleItalics;
    }
  };

  // Shorten name
  const displayName = verse.name.trim()
    .replace(/verse */gi, "");

  return (
    <Animated.View style={[styles.container, animatedStyle.container]}>
      {displayName === "" ? undefined :
        <Animated.Text style={[
          styles.title,
          (Settings.coloredVerseTitles ? styles.titleColored : {}),
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
  titleColored: {
    color: colors.primary,
    fontStyle: "normal"
  },
  titleItalics: {
    fontStyle: "italic"
  },
  text: {
    color: colors.text
  }
});
