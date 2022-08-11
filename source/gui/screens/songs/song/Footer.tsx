import React from "react";
import { Song } from "../../../../logic/db/models/Songs";
import { createCopyright } from "../../../../logic/songs/utils";
import { Animated, StyleSheet } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";

interface Props {
  song?: Song;
}

const Footer: React.FC<Props> = ({ song }) => {
  const styles = createStyles(useTheme());

  return (<Animated.View style={styles.container}>
    <Animated.Text style={[styles.copyright]}>{createCopyright(song)}</Animated.Text>
  </Animated.View>);
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    width: "50%",
    marginTop: 70,
    marginBottom: 100,
    alignSelf: "center"
  },
  copyright: {
    textAlign: "center",
    color: colors.textLighter,
    fontFamily: fontFamily.sansSerifLight,
    marginTop: 20,
    lineHeight: 25
  }
});

export default Footer;
