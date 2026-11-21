import { interpolateColor, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useTheme } from "../../../components/providers/ThemeProvider";

export const VerseStyleValues = {
  container: {
    paddingTop: 0,
    paddingBottom: 40,
  },
  title: {
    fontSize: 19,
    lineHeight: 28,
  },
  titleLarge: {
    fontSize: 30,
    lineHeight: 40,
  },
  text: {
    fontSize: 20,
    lineHeight: 28,
  },
} as const;

function hexToTransparentRgba(hex: string): string {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return `rgba(${r}, ${g}, ${b}, 0)`;
  }
  if (normalized.length === 6 || normalized.length === 8) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0)`;
  }
  return "rgba(0, 0, 0, 0)";
}

export function useHighlightAnimatedStyle(highlightProgress?: SharedValue<number>) {
  const { colors } = useTheme();
  const defaultTextColor = String(colors.text.default);
  const highlightForegroundColor = String(colors.text.highlighted.foreground);
  const highlightBackgroundColor = String(colors.text.highlighted.background);
  const transparentHighlightBackground = hexToTransparentRgba(highlightBackgroundColor);

  return useAnimatedStyle(() => {
    if (!highlightProgress) {
      return {
        color: highlightForegroundColor,
        backgroundColor: highlightBackgroundColor,
      };
    }

    const progress = highlightProgress.value;
    return {
      color: interpolateColor(progress, [0, 1], [defaultTextColor, highlightForegroundColor]),
      backgroundColor: interpolateColor(progress, [0, 1], [transparentHighlightBackground, highlightBackgroundColor]),
    };
  }, [
    highlightProgress,
    defaultTextColor,
    highlightForegroundColor,
    highlightBackgroundColor,
    transparentHighlightBackground,
  ]);
}
