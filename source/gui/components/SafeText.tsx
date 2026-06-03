import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";
import { defaultFontFamilies } from "../../logic/theme.ts";
import Animated from "react-native-reanimated";

const SafeText: React.FC<TextProps> = ({ style, ...props }) => {
  return <Text style={[styles.text, style]} {...props}>
  </Text>;
};

const styles = StyleSheet.create({
  text: {
    fontFamily: defaultFontFamilies.sansSerif,
  },
});

export default SafeText;

export const AnimatedSafeText = Animated.createAnimatedComponent(SafeText);