import React from "react";
import { Song } from "../../models/Songs";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

interface Props {
  opacity: Animated.Value<number>,
  song?: Song
}

const Footer: React.FC<Props> =
  ({ opacity }) => {
    const styles = createStyles(useTheme());
    const animatedStyle = {
      container: {
        opacity: opacity
      }
    };

    return (<Animated.View style={[styles.container, animatedStyle.container]} />);
  };

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    width: "50%",
    marginTop: 70,
    marginBottom: 100,
    alignSelf: "center"
  }
});

export default Footer;
