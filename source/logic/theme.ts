import { ColorValue } from "react-native";
import { isIOS } from "./utils";

export interface ThemeColors {
  primary: ColorValue,
  primaryVariant: ColorValue,
  primaryLight: ColorValue,
  background: ColorValue,
  surface1: ColorValue,
  surface2: ColorValue,
  surface3: ColorValue,
  onPrimary: ColorValue,
  text: ColorValue,
  textLight: ColorValue,
  textLighter: ColorValue,
  textHeader: ColorValue,
  textHighlightedForeground: ColorValue,
  textHighlightedBackground: ColorValue,
  verseTitle: ColorValue,
  url: ColorValue,
  button: ColorValue,
  buttonVariant: ColorValue,
  border: ColorValue,
  borderLight: ColorValue,
  borderVariant: ColorValue,
  shadow: ColorValue,
  shadowDarker: ColorValue,
  notesColor: ColorValue,
  notesLines: ColorValue,
  switchComponentThumb: ColorValue,
  switchComponentBackground?: ColorValue,
  badge: {
    medium: "#ff9100"
  }
}

export const lightColors: ThemeColors = {
  primary: "dodgerblue",
  primaryVariant: "dodgerblue",
  primaryLight: "#63adff",
  background: "#f1f1f1",
  surface1: "#fbfbfb",
  surface2: "#ffffff",
  surface3: "#707070",
  onPrimary: "#fff",
  text: "#000",
  textLight: "#555",
  textLighter: "#8d8d8e",
  textHeader: "#1c1c1c",
  textHighlightedForeground: "#000",
  textHighlightedBackground: "#ccc",
  verseTitle: "#333",
  url: "#57a4fd",
  button: "#fcfcfc",
  buttonVariant: "#f5f5f5",
  border: "#ddd",
  borderLight: "#eee",
  borderVariant: "#ccc",
  shadow: "#eaeaea",
  shadowDarker: "#ddd",
  notesColor: "#222",
  notesLines: "#444",
  switchComponentThumb: isIOS ? "#fff" : "dodgerblue",
  switchComponentBackground: isIOS ? "#eee" : undefined,
  badge: {
    medium: "#ff9100"
  }
};

export const darkColors: ThemeColors = {
  primary: "dodgerblue",
  primaryVariant: "#1576d5",
  primaryLight: "#2776cc",
  background: "#202020",
  surface1: "#303030",
  surface2: "#3a3a3a",
  surface3: "#3a3a3a",
  onPrimary: "#eee",
  text: "#eee",
  textLight: "#ccc",
  textLighter: "#ccc",
  textHeader: "#eee",
  textHighlightedForeground: "#fff",
  textHighlightedBackground: "#6a6a6a",
  verseTitle: "#e0e0e0",
  url: "#57a4fd",
  button: "#3a3a3a",
  buttonVariant: "#303030",
  border: "#202020",
  borderLight: "#202020",
  borderVariant: "#aaa",
  shadow: "#242424",
  shadowDarker: "#242424",
  notesColor: "#d0d0d0",
  notesLines: "#888",
  switchComponentThumb: isIOS ? "#fff" : "dodgerblue",
  switchComponentBackground: undefined,
  badge: {
    medium: "#ff9100"
  }
};

export interface ThemeFontFamilies {
  sansSerif: string,
  sansSerifLight: string,
  sansSerifThin: string,
}

export const defaultFontFamilies: ThemeFontFamilies = {
  sansSerif: "Roboto",
  sansSerifLight: "Roboto-Light",
  sansSerifThin: "Roboto-Thin"
};
