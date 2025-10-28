import React from "react";
import Settings from "../../../../settings";
import { Song } from "../../../../logic/db/models/songs/Songs";
import { createHeader } from "../../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { StyleSheet } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface Props {
  song?: Song;
  scale: SharedValue<number>;
}

const Header: React.FC<Props> = ({ song, scale }) => {
  const styles = createStyles(useTheme());
  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      paddingTop: scale.value * styles.container.paddingTop,
      paddingBottom: scale.value * styles.container.paddingBottom
    })),
    text: useAnimatedStyle(() => ({
      lineHeight: scale.value * styles.text.lineHeight,
      fontSize: scale.value * styles.text.fontSize
    }))
  };

  const headerText = createHeader(song);
  if (headerText.length === 0) {
    return null;
  }

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <Animated.Text style={[styles.text, animatedStyle.text]}
                   selectable={Settings.enableTextSelection}>
      {headerText}
    </Animated.Text>
  </Animated.View>;
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingTop: 15,
    paddingBottom: 15
  },
  text: {
    color: colors.text.lighter,
    fontFamily: fontFamily.sansSerifLight,
    fontStyle: "italic",
    lineHeight: 20,
    fontSize: 14
  }
});

export default Header;
