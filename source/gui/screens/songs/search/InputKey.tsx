import React, { PropsWithChildren } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { objectToArrayIfNotAlready } from "../../../../logic/utils/utils.ts";

interface KeyProps extends PropsWithChildren {
  onPress?: () => void;
  onLongPress?: () => void,
  extraStyle?: Object;
  accessibilityLabel?: string;
}

export const Key: React.FC<KeyProps> = ({
                                          children,
                                          onPress,
                                          onLongPress,
                                          extraStyle,
                                          accessibilityLabel
                                        }) => {
  const styles = createStyles(useTheme());
  const keyTextStyle: Array<Object> = [styles.keyText, ...objectToArrayIfNotAlready(extraStyle)];

  return <TouchableOpacity style={styles.key}
                           onPress={onPress}
                           onLongPress={onLongPress}
                           accessibilityLabel={accessibilityLabel}>
    <Text style={keyTextStyle}
          importantForAccessibility={accessibilityLabel ? "no" : "auto"}
          accessibilityElementsHidden={!!accessibilityLabel}>
      {children}
    </Text>
  </TouchableOpacity>
};

export const NumberKey: React.FC<{ number: number, onPress: (number: number) => void, useSmallerFontSize?: boolean }> =
  ({ number, onPress, useSmallerFontSize = false }) => {
    const styles = createStyles(useTheme());
    return <Key onPress={() => onPress(number)}
                extraStyle={!useSmallerFontSize ? undefined : styles.keyTextSmaller}>
      {number}
    </Key>;
  };

export const ClearKey: React.FC<{ onPress?: () => void, text?: string, useSmallerFontSize?: boolean }> =
  ({ onPress, text = "Clear", useSmallerFontSize = false }) => {
    const styles = createStyles(useTheme());
    return <Key onPress={onPress}
                accessibilityLabel={"Clear input"}
                extraStyle={[styles.specialKeyText, (!useSmallerFontSize ? undefined : styles.specialKeyTextSmaller)]}>{text}</Key>;
  };

export const BackspaceKey: React.FC<{
  onPress?: () => void,
  onLongPress?: () => void,
  useSmallerFontSize?: boolean
}> =
  ({ onPress, onLongPress, useSmallerFontSize = false }) => {
    const styles = createStyles(useTheme());
    const fontSize = useSmallerFontSize ? styles.keyTextSmaller.fontSize - 8 : styles.keyText.fontSize - 10;
    return <Key onPress={onPress}
                onLongPress={onLongPress}
                accessibilityLabel={"Backspace"}
                extraStyle={[styles.specialKeyText, (!useSmallerFontSize ? undefined : styles.specialKeyTextSmaller)]}>
      <Icon name="backspace" size={fontSize} color={styles.keyText.color as string} />
    </Key>;
  };


const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
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
    fontFamily: fontFamily.sansSerifThin,
    color: colors.text.light
  },
  keyTextSmaller: {
    fontSize: 34
  },
  specialKeyText: {
    fontSize: 20,
    fontFamily: fontFamily.sansSerifLight
  },
  specialKeyTextSmaller: {
    fontSize: 18
  }
});
