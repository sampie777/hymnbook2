import React, { memo } from "react";
import { AbcConfig, useAbcMusicStyle } from "../config.ts";
import { useTheme } from "../../providers/ThemeProvider.tsx";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet, useWindowDimensions } from "react-native";
import { AnimatedSafeText } from "../../SafeText.tsx";

interface Props {
  melodyScale: SharedValue<number>
  showChords: boolean
}

const Lines: React.FC<Props> = ({ melodyScale, showChords }) => {
  const charWidth = 7.238098
  const windowDimension = useWindowDimensions();
  const theme = useTheme();

  const animatedStyles = {
    container: useAnimatedStyle(() => ({
      top: !showChords ? undefined : melodyScale.value * AbcConfig.chordTopSpace,
    })),
    note: useAbcMusicStyle(melodyScale, theme)
  }

  return <Animated.View
    style={[styles.container, animatedStyles.container, { transform: [{ scaleX: 2 * windowDimension.width / charWidth }] }]}>
    <AnimatedSafeText style={[animatedStyles.note, { color: theme.colors.notes.lines }]}>{"="}</AnimatedSafeText>
  </Animated.View>
};

export default memo(Lines);


const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});