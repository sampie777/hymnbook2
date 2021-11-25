import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

interface KeyProps {
  onPress: () => void;
  extraStyle?: Object;
}

const isDark = true;

export const Key: React.FC<KeyProps> = ({ children, onPress, extraStyle }) => {
  const styles = createStyles(useTheme());
  const keyTextStyle: Array<Object> = [styles.keyText];
  if (extraStyle !== undefined) {
    keyTextStyle.push(extraStyle);
  }

  return (
    <TouchableOpacity style={styles.key}
                      onPress={onPress}>
      <Text style={keyTextStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

export const NumberKey: React.FC<{ number: number, onPress: (number: number) => void }> =
  ({ number, onPress }) => (
    <Key onPress={() => onPress(number)}>
      {number}
    </Key>
  );

export const ClearKey: React.FC<{ onPress: () => void, text?: string }> =
  ({ onPress, text = "Clear" }) => {
    const styles = createStyles(useTheme());
    return <Key onPress={onPress}
                extraStyle={styles.specialKeyText}>{text}</Key>;
  };

export const BackspaceKey: React.FC<{ onPress: () => void }> =
  ({ onPress }) => {
    const styles = createStyles(useTheme());
    return <Key onPress={onPress}
                extraStyle={styles.specialKeyText}>
      <Icon name="backspace" size={styles.keyText.fontSize - 10} color={styles.keyText.color as string} />
    </Key>;
  };


const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  key: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface2,
    borderColor: colors.background,
    borderWidth: 1
  },
  keyText: {
    fontSize: 40,
    fontFamily: "sans-serif-thin",
    color: colors.textLighter
  },
  specialKeyText: {
    fontSize: 20,
    fontFamily: "sans-serif-light"
  }
});
