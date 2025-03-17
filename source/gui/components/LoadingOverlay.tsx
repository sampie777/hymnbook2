import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ThemeContextProps, useTheme } from "./providers/ThemeProvider";
import LoadingIndicator from "./LoadingIndicator";


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

    const animatedOpacity = useSharedValue(animate ? 0 : 1);
    const _animate = () => {
      if (!animate) {
        animatedOpacity.value = 1;
        return;
      }

      animatedOpacity.value = withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease)
      });
    };

    useEffect(_animate, []);

    const animatedStyleContainer = useAnimatedStyle(() => ({
      opacity: animatedOpacity.value
    }));

    return (
      <Animated.View style={[styles.container, animatedStyleContainer]}>
        <LoadingIndicator />
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
  text: {
    paddingTop: 10,
    fontSize: 16,
    color: colors.text.lighter,
    textAlign: "center"
  }
});
