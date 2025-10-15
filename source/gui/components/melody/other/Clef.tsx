import React from "react";
import { useAbcMusicStyle } from "../config";
import { AbcClef } from "../../../../logic/songs/abc/abcjsTypes";
import { ThemeContextProps } from "../../providers/ThemeProvider";
import Animated, { SharedValue } from "react-native-reanimated";

interface Props {
  melodyScale: SharedValue<number>;
  clef: AbcClef;
}

const Clef: React.FC<Props> = ({ melodyScale, clef }) => {
  const animatedStyle = useAbcMusicStyle(melodyScale);

  return <Animated.Text style={animatedStyle}>
    {clef.type !== "bass" ? "&" : "0"}
  </Animated.Text>
};

const createStyles = ({ colors }: ThemeContextProps) => ({
  container: {},
  color: colors.notes.color
});

export default Clef;
