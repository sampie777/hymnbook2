import React from "react";
import Settings from "../../../../settings";
import { Song } from "../../../../logic/db/models/songs/Songs";
import { createHeader } from "../../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { StyleSheet } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { AnimatedSafeText } from "../../../components/SafeText.tsx";

interface Props {
  song?: Song;
  scale: SharedValue<number>;
}

const Header: React.FC<Props> = ({ song, scale }) => {
  const styles = createStyles(useTheme());
  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      paddingTop: scale.value * 15,
      paddingBottom: scale.value * 15,
      marginBottom: scale.value * 10
    })),
    text: useAnimatedStyle(() => ({
      lineHeight: scale.value * 20,
      fontSize: scale.value * 14
    }))
  };

  const headerText = createHeader(song);
  if (headerText.length === 0) {
    return <Animated.View style={useAnimatedStyle(() => ({marginBottom: scale.value * 10}))}/>;
  }

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <AnimatedSafeText style={[styles.text, animatedStyle.text]}
                      selectable={Settings.enableTextSelection}>
      {headerText}
    </AnimatedSafeText>
  </Animated.View>;
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {},
  text: {
    color: colors.text.lighter,
    fontFamily: fontFamily.sansSerifLight,
    fontStyle: "italic",
  }
});

export default Header;
