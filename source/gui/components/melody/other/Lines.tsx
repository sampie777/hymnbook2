import React, { memo } from "react";
import { useAbcMusicStyle } from "../config.ts";
import { useTheme } from "../../providers/ThemeProvider.tsx";
import Animated, { SharedValue } from "react-native-reanimated";
import { StyleSheet, useWindowDimensions, View } from "react-native";

interface Props {
  melodyScale: SharedValue<number>
}

const Lines: React.FC<Props> = ({ melodyScale }) => {
  const charWidth = 7.238098
  const windowDimension = useWindowDimensions();
  const theme = useTheme();

  const animatedStyles = {
    note: useAbcMusicStyle(melodyScale, theme)
  }

  return <View style={[styles.container, { transform: [{ scaleX: 2 * windowDimension.width / charWidth }] }]}>
    <Animated.Text style={[animatedStyles.note, { color: theme.colors.notes.lines }]}>{"="}</Animated.Text>
  </View>
};

export default memo(Lines);


const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});