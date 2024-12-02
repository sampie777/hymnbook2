import { ColorValue } from "react-native";
import { isIOS } from "./utils";

export interface ThemeColors {
  primary: {
    default: ColorValue,
    variant: ColorValue,
    light: ColorValue,
  },
  background: ColorValue,
  surface1: ColorValue,
  surface2: ColorValue,
  surface3: ColorValue,
  onPrimary: ColorValue,
  text: {
    default: ColorValue,
    light: ColorValue,
    lighter: ColorValue,
    disabled: ColorValue,
    header: ColorValue,
    highlighted: {
      foreground: ColorValue,
      background: ColorValue,
    },
  },
  verseTitle: ColorValue,
  url: ColorValue,
  button: {
    default: ColorValue,
    variant: ColorValue,
  },
  border: {
    default: ColorValue,
    light: ColorValue,
    variant: ColorValue,
  },
  notes: {
    color: ColorValue,
    lines: ColorValue,
  },
  switchComponent: {
    thumb: ColorValue,
    background?: ColorValue,
  },
  badge: {
    medium: ColorValue,
  },
  delete: ColorValue,
}

export const lightColors: ThemeColors = {
  primary: {
    default: "dodgerblue",
    variant: "dodgerblue",
    light: "#63adff"
  },
  background: "#f1f1f1",
  surface1: "#fbfbfb",
  surface2: "#ffffff",
  surface3: "#707070",
  onPrimary: "#fff",
  text: {
    default: "#000",
    light: "#555",
    lighter: "#8d8d8e",
    disabled: "#ccc",
    header: "#1c1c1c",
    highlighted: {
      foreground: "#000",
      background: "#ccc"
    }
  },
  verseTitle: "#333",
  url: "#57a4fd",
  button: {
    default: "#fcfcfc",
    variant: "#f5f5f5"
  },
  border: {
    default: "#ddd",
    light: "#eee",
    variant: "#ccc"
  },
  notes: {
    color: "#222",
    lines: "#444"
  },
  switchComponent: {
    thumb: isIOS ? "#fff" : "dodgerblue",
    background: "#eee"
  },
  badge: {
    medium: "#ff9100"
  },
  delete: "#f17c7c",
};

export const darkColors: ThemeColors = {
  primary: {
    default: "dodgerblue",
    variant: "#1576d5",
    light: "#2776cc"
  },
  background: "#202020",
  surface1: "#303030",
  surface2: "#3a3a3a",
  surface3: "#3a3a3a",
  onPrimary: "#eee",
  text: {
    default: "#eee",
    light: "#ccc",
    lighter: "#ccc",
    disabled: "#6a6a6a",
    header: "#eee",
    highlighted: {
      foreground: "#fff",
      background: "#6a6a6a"
    }
  },
  verseTitle: "#e0e0e0",
  url: "#57a4fd",
  button: {
    default: "#3a3a3a",
    variant: "#303030"
  },
  border: {
    default: "#202020",
    light: "#202020",
    variant: "#aaa"
  },
  notes: {
    color: "#d0d0d0",
    lines: "#888"
  },
  switchComponent: {
    thumb: isIOS ? "#fff" : "dodgerblue",
    background: undefined
  },
  badge: {
    medium: "#ff9100"
  },
  delete: "#f17c7c",
};

export interface ThemeFontFamilies {
  sansSerif: string,
  sansSerifLight: string,
  sansSerifThin: string,
}

export const defaultFontFamilies: ThemeFontFamilies = {
  sansSerif: "Roboto-Regular",
  sansSerifLight: "Roboto-Light",
  sansSerifThin: "Roboto-Thin"
};
