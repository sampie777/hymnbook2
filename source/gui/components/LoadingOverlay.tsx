import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import { ThemeContextProps, useTheme } from "./ThemeProvider";


interface Props {
  isVisible: boolean,
  text?: string | null,
  animate?: boolean,
}

const LoadingOverlay: React.FC<Props> =
  ({ isVisible, text, animate = false }) => {
    if (!isVisible) {
      return null;
    }

    const styles = createStyles(useTheme());

    if (text === undefined) {
      text = "Loading...";
    }

    const animatedOpacity = new Animated.Value(animate ? 0 : 1);
    const _animate = () => {
      if (!animate) {
        animatedOpacity.setValue(1);
        return;
      }

      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease)
      })
        .start();
    };

    useEffect(_animate, []);

    const animatedStyle = {
      container: {
        opacity: animatedOpacity
      }
    };

    return (
      <Animated.View style={[styles.container, animatedStyle.container]}>
        <ActivityIndicator style={styles.icon}
                           size={styles.icon.fontSize}
                           color={styles.icon.color} />
        {text === "" || text === null ? null : <Text style={styles.text}>{text}</Text>}
      </Animated.View>
    );
  };


export default LoadingOverlay;

const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    backgroundColor: isDark ? colors.background : "#fffc",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9
  },
  icon: {
    fontSize: 80,
    color: colors.textLighter,
    opacity: 0.7
  },
  text: {
    paddingTop: 10,
    fontSize: 16,
    color: colors.textLighter,
    textAlign: "center"
  }
});
