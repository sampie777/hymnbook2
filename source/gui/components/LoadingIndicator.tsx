import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { isIOS } from "../../logic/utils";
import { ThemeContextProps, useTheme } from "./providers/ThemeProvider";

interface Props {
  size?: number | "small" | "large"
  opacity?: number
}

const LoadingIndicator: React.FC<Props> = ({ size, opacity = 0.7 }) => {
  const styles = createStyles(useTheme());

  return <ActivityIndicator style={{ ...styles.icon, opacity: opacity }}
                            size={size ? size : (isIOS ? "large" : styles.icon.fontSize)}
                            color={styles.icon.color} />
};

export default LoadingIndicator;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  icon: {
    fontSize: 80,
    color: colors.text.lighter,
  },
});
