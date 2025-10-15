import { Platform } from "react-native";
import { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { isIOS } from "../../../logic/utils.ts";

export const AbcConfig = {
  baseScale: 0.79,

  topSpacing: 20,
  lineSpacing: 8,
  textSpacing: 13,

  lineWidth: 1,
  lineBarThinWidth: 1.5,
  lineBarThickWidth: 8,

  noteSize: 40,
  notePadding: 0,
  noteWidth: 4.8,
  noteHeight: 2.8,
  stemHeight: 28,
  stemWidth: 2,
  accidentalWidth: 8,
  spacerWidth: 7,

  textPadding: 3,
  textSize: 20,
  textLineHeight: 40,

  totalLineHeight: 0,
  introEmptyGapWidth: 10,

  sharpOffsetY: Platform.OS === "ios" ? 9 : 6,
  flatFontSize: Platform.OS === "ios" ? 28 : 34,
  flatOffsetY: Platform.OS === "ios" ? 9 : 4,
  naturalOffsetY: Platform.OS === "ios" ? 12 : 4,
};

AbcConfig.totalLineHeight = AbcConfig.topSpacing + 4 * AbcConfig.lineSpacing + AbcConfig.textSpacing;

export const useAbcMusicStyle = (scale: SharedValue<number>) =>
  useAnimatedStyle(() => ({
    fontFamily: isIOS ? "Musiqwik" : "Musiqwik-regular-extended",
    fontSize: scale.value * AbcConfig.noteSize,
  }))
