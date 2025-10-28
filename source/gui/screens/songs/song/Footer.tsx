import React from "react";
import Settings from "../../../../settings";
import { Song } from "../../../../logic/db/models/songs/Songs";
import { createCopyright } from "../../../../logic/songs/utils";
import { StyleSheet, useWindowDimensions } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface Props {
  song?: Song;
  scale: SharedValue<number>;
}

const Footer: React.FC<Props> = ({ song, scale }) => {
  const styles = createStyles(useTheme());
  const windowDimension = useWindowDimensions();
  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      paddingTop: scale.value * styles.container.paddingTop,
      paddingBottom: scale.value * styles.container.paddingBottom
    })),
    divider: useAnimatedStyle(() => ({
      marginBottom: scale.value * styles.divider.marginBottom
    })),
    text: useAnimatedStyle(() => ({
      lineHeight: scale.value * styles.text.lineHeight,
      fontSize: scale.value * styles.text.fontSize,
      paddingBottom: scale.value * styles.text.paddingBottom
    })),
  };

  return <Animated.View
    style={[styles.container, animatedStyle.container, { minHeight: windowDimension.height - useHeaderHeight() - 200 }]}>
    <Animated.View style={[styles.divider, animatedStyle.divider]}></Animated.View>
    {createCopyright(song).map((it, i) =>
      <Animated.Text key={i}
                     style={[styles.text, animatedStyle.text]}
                     selectable={Settings.enableTextSelection}>
        {it}
      </Animated.Text>
    )}
  </Animated.View>;
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingBottom: 100
  },
  divider: {
    marginBottom: 30,
    width: "50%",
    alignSelf: "center",
    borderTopColor: colors.border.default,
    borderTopWidth: 1
  },
  text: {
    textAlign: "center",
    color: colors.text.lighter,
    fontFamily: fontFamily.sansSerifLight,
    lineHeight: 20,
    fontSize: 14,
    paddingBottom: 5
  }
});

export default Footer;
