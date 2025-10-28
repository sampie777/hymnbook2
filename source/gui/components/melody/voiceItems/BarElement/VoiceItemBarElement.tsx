import React from "react";
import { VoiceItemBar } from "../../../../../logic/songs/abc/abcjsTypes";
import Animated, { SharedValue } from "react-native-reanimated";
import { useAbcMusicStyle } from "../../config.ts";
import { useTheme } from "../../../providers/ThemeProvider.tsx";

interface Props {
  item: VoiceItemBar;
  melodyScale: SharedValue<number>;
}

const VoiceItemBarElement: React.FC<Props> = ({ item, melodyScale }) => {
  const animatedStyle = useAbcMusicStyle(melodyScale, useTheme());

  return <Animated.Text style={animatedStyle}>
    {item.type == "bar_thin_thick" ? "." : ""}
    {item.type == "bar_thin" ? "Ā" : ""}
  </Animated.Text>
};

export default VoiceItemBarElement;
