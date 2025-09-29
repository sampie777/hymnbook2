import React from 'react';
import { ActivityIndicator, ColorValue, StyleSheet } from 'react-native';
import { isIOS } from "../../logic/utils";
import { ThemeContextProps, useTheme } from "./providers/ThemeProvider";

interface Props {
  size?: number | "small" | "large"
  opacity?: number,
  color?: ColorValue,
}

const LoadingIndicator: React.FC<Props> = ({ size, opacity = 0.7, color }) => {
  const styles = createStyles(useTheme(), color);

  return <ActivityIndicator style={{ ...styles.icon, opacity: opacity }}
                            size={size ? size : (isIOS ? "large" : styles.icon.fontSize)}
                            color={styles.icon.color} />
};

export default LoadingIndicator;

const createStyles = ({ colors }: ThemeContextProps, color?: ColorValue) => StyleSheet.create({
  icon: {
    fontSize: 80,
    color: color ?? colors.text.lighter,
  },
});
