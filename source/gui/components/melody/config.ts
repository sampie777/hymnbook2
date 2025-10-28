import { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { ThemeContextProps } from "../providers/ThemeProvider.tsx";

export const AbcConfig = {
  baseScale: 0.9,

  noteSize: 40,
  notePadding: 0,
  noteWidth: 14.8,
  accidentalWidth: 18,
  spacerWidth: 7,

  textPadding: 3,
  textSize: 20,
  textLineHeight: 40,
};

export const useAbcMusicStyle = (scale: SharedValue<number>, theme?: ThemeContextProps) =>
  useAnimatedStyle(() => ({
    fontFamily: "MusiQwikCustom",
    fontSize: scale.value * AbcConfig.noteSize,
    color: theme?.colors.notes.color,
  }))
