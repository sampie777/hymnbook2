import React from "react";
import { Song } from "../../../../logic/db/models/Songs";
import { createHeader } from "../../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { Animated, StyleSheet } from "react-native";

interface Props {
  song?: Song;
  scale: Animated.Value;
}

const Header: React.FC<Props> = ({ song, scale }) => {
  const styles = createStyles(useTheme());
  const animatedStyle = {
    container: {
      paddingTop: Animated.multiply(scale, styles.container.paddingTop),
      paddingBottom: Animated.multiply(scale, styles.container.paddingBottom)
    },
    text: {
      lineHeight: Animated.multiply(scale, styles.text.lineHeight),
      fontSize: Animated.multiply(scale, styles.text.fontSize)
    },
  }

  const headerText = createHeader(song);
  if (headerText.length === 0) {
    return null;
  }

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <Animated.Text style={[styles.text, animatedStyle.text]}>{headerText}</Animated.Text>
  </Animated.View>;
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  text: {
    color: colors.text.lighter,
    fontFamily: fontFamily.sansSerifLight,
    fontStyle: "italic",
    lineHeight: 20,
    fontSize: 14,
  }
});

export default Header;
