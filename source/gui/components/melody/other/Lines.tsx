import React, { memo } from "react";
import { useAbcMusicStyle } from "../config.ts";
import { useTheme } from "../../providers/ThemeProvider.tsx";
import Animated, { SharedValue } from "react-native-reanimated";
import { useWindowDimensions, View } from "react-native";

interface Props {
  melodyScale: SharedValue<number>
}

const Lines: React.FC<Props> = ({ melodyScale }) => {
  const charWidth = 7.238098
  const windowDimension = useWindowDimensions();
  const theme = useTheme();

  const styles = {
    container: {
      transform: [{ scaleX: windowDimension.width / charWidth }],
    },
    note: useAbcMusicStyle(melodyScale, theme)
  }

  return <View style={styles.container}>
    <Animated.Text style={[styles.note, { color: theme.colors.notes.lines }]}>{"=="}</Animated.Text>
  </View>
};

export default memo(Lines);
