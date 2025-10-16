import React from "react";
import { useAbcMusicStyle } from "../config.ts";
import { useTheme } from "../../providers/ThemeProvider.tsx";
import Animated, { SharedValue } from "react-native-reanimated";
import { useWindowDimensions, View } from "react-native";

interface Props {
  melodyScale: SharedValue<number>
}

const Lines: React.FC<Props> = ({ melodyScale }) => {
  const windowDimension = useWindowDimensions();
  const charWidth = 7.238098

  const animatedStyle = {
    container: {
      transform: [{ scaleX: windowDimension.width / charWidth }],
    },
    note: useAbcMusicStyle(melodyScale, useTheme())
  }

  return <View style={animatedStyle.container}>
    <Animated.Text style={animatedStyle.note}>{"="}</Animated.Text>
  </View>
};

export default Lines;
