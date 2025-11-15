import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import Settings from '../../../../settings.ts';
import { isIOS } from '../../../../logic/utils/utils.ts';
import { ThemeContextProps, useTheme, } from '../../../components/providers/ThemeProvider.tsx';
import config from '../../../../config.ts';

interface Props {
  value: string
  previousValue: string
  useSmallerFontSize: boolean
  onPress?: () => void
}

export const SongNumberInputTextAndroid: React.FC<Props> = ({ value, previousValue, onPress, useSmallerFontSize }) => {
  const styles = createStyles(useTheme());

  return <Text onPress={onPress}
               style={[styles.text, (!useSmallerFontSize ? {} : styles.textSmaller)]}
               importantForAccessibility={value ? "auto" : "no"}
               accessibilityElementsHidden={!value}>
    {value ? value
      : (!Settings.songSearchRememberPreviousEntry ? " " :
          <>{isIOS ? "" : " "}<Text
            style={styles.placeholder}>{previousValue}</Text> </>
      )
    }
  </Text>
};

export const SongNumberInputTextMacBook: React.FC<Props & {
  setInputValue: Dispatch<SetStateAction<string>>
}> = ({ value, previousValue, onPress, useSmallerFontSize, setInputValue }) => {
  const styles = createStyles(useTheme());

  // Use `previousValue`, so we don't have to use the `inputValue` state directly,
  // which causes unnecessary component updates.
  const onNumberKeyPress = (number: number) =>
    setInputValue((prev) =>
      prev.length >= config.maxSearchInputLength ? prev : prev + number
    );

  const onDeleteKeyPress = () =>
    setInputValue(prev => prev.length <= 1 ? "" : prev.substring(0, prev.length - 1))

  const onKeyPress = (key: string) => {
    if (key === "Backspace") {
      onDeleteKeyPress()
    } else if (!isNaN(+key)) {
      onNumberKeyPress(+key)
    }
  }

  return <TextInput
    caretHidden={true}
    keyboardType={'decimal-pad'}
    autoFocus={true}
    inputMode={'decimal'}
    onPressIn={!Settings.songSearchRememberPreviousEntry || value ? () => console.debug("Nothing", Settings.songSearchRememberPreviousEntry, value) : onPress}
    onKeyPress={e => onKeyPress(e.nativeEvent.key)}
    value={value}
    placeholder={Settings.songSearchRememberPreviousEntry ? previousValue : undefined}
    placeholderTextColor={styles.placeholder.color}
    style={[
      styles.text,
      !useSmallerFontSize ? {} : styles.textSmaller,
      Settings.songSearchRememberPreviousEntry && !value ? styles.placeholder : {}
    ]}
    importantForAccessibility={value ? 'auto' : 'no'}
    accessibilityElementsHidden={!value}></TextInput>
};

const createStyles = ({ isDark, colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  text: {
    fontSize: 70,
    textAlign: "center",
    fontFamily: fontFamily.sansSerifLight,
    color: colors.text.light,
  },
  placeholder: {
    color: isDark ? (isIOS ? "#303030" : "#2a2a2a00") : "#e5e5e5",
    textShadowColor: isDark ? (isIOS ? "#404040" : "#404040aa") : "#ddd",
    textShadowRadius: 12
  },
  textSmaller: {
    fontSize: 40
  },
});
