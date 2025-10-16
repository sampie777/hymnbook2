import React from "react";
import { useAbcMusicStyle } from "../config";
import { AbcClef } from "../../../../logic/songs/abc/abcjsTypes";
import { useTheme } from "../../providers/ThemeProvider";
import Animated, { SharedValue } from "react-native-reanimated";

interface Props {
  melodyScale: SharedValue<number>;
  clef: AbcClef;
}

const Clef: React.FC<Props> = ({ melodyScale, clef }) => {
  const animatedStyle = useAbcMusicStyle(melodyScale, useTheme());

  return <Animated.Text style={animatedStyle}>
    {clef.type !== "bass" ? "&" : "0"}
  </Animated.Text>
};

export default Clef;
