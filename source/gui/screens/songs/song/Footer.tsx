import React from "react";
import { Song } from "../../../../logic/db/models/Songs";
import { createCopyright } from "../../../../logic/songs/utils";
import { Animated, StyleSheet, useWindowDimensions } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { useHeaderHeight } from "@react-navigation/elements";

interface Props {
  song?: Song;
}

const Footer: React.FC<Props> = ({ song }) => {
  const styles = createStyles(useTheme());
  const windowDimension = useWindowDimensions();

  return <Animated.View style={[styles.container, { minHeight: windowDimension.height - useHeaderHeight() - 200 }]}>
    <Animated.Text style={[styles.copyright]}>{createCopyright(song)}</Animated.Text>
  </Animated.View>;
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    width: "50%",
    paddingTop: 100,
    paddingBottom: 100,
    alignSelf: "center"
  },
  copyright: {
    textAlign: "center",
    color: colors.textLighter,
    fontFamily: fontFamily.sansSerifLight,
    lineHeight: 25
  }
});

export default Footer;
