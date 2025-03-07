import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ShowAllLanguagesValue } from "./LanguageSelectBar";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";

export const DownloadIcon: React.FC = () => {
  const styles = createStyles(useTheme());

  return <Icon name={"cloud-download-alt"}
               style={styles.downloadIcon} />;
};

export const IsDownloadedIcon: React.FC = () => {
  const styles = createStyles(useTheme());

  return <Icon name={"check"}
               style={styles.isDownloadedIcon} />;
};

export const IsDownloadingIcon: React.FC = () => {
  const rotation = useSharedValue<number>(0);
  const styles = createStyles(useTheme());
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }]
  }))

  useEffect(() => {
    // Set to 0, as reloading of the component may cause it to start
    // from a random value resulting in non completing circles
    rotation.value = 0
    rotation.value = withRepeat(withTiming(360, {
      duration: 1300,
      easing: Easing.linear
    }), 0)

    return () => cancelAnimation(rotation)
  })

  const AnimatedIcon = Animated.createAnimatedComponent(Icon)
  return <AnimatedIcon name={"sync"}
                       style={[styles.isDownloadingIcon, animatedStyle]} />;
};

export const UpdateIcon: React.FC = () => {
  const styles = createStyles(useTheme());

  return <>
    <IsDownloadedIcon />
    <Icon name={"arrow-circle-down"}
          style={styles.updateIconCornerShadow} />
    <Icon name={"arrow-circle-down"}
          style={styles.updateIconCorner} />
  </>;
};


const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  downloadIcon: {
    fontSize: 18,
    color: "dodgerblue"
  },

  isDownloadedIcon: {
    fontSize: 18,
    color: "#0d0"
  },

  isDownloadingIcon: {
    fontSize: 18,
    color: "dodgerblue"
  },

  updateIconCornerShadow: {
    position: "absolute",
    color: colors.surface1,
    fontSize: 14,
    right: -6,
    bottom: -3
  },
  updateIconCorner: {
    position: "absolute",
    color: "orange",
    fontSize: 11,
    right: -5,
    bottom: -2
  }
});

export const itemCountPerLanguage = (bundles: { language: string }[]): Map<string, number> => {
  const result = new Map<string, number>();
  bundles.forEach(it => {
    result.set(it.language, (result.get(it.language) ?? 0) + 1);
    result.set(ShowAllLanguagesValue, (result.get(ShowAllLanguagesValue) ?? 0) + 1);
  });
  return result;
};