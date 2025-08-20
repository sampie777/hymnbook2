import React, { Dispatch, SetStateAction } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Settings from "../../../../settings";
import { isIOS } from "../../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import config from '../../../../config';

type Props = {
  value: string
  previousValue: string
  useSmallerFontSize: boolean
  onPress?: () => void
  setInputValue: Dispatch<SetStateAction<string>>
};

const SongNumberInput: React.FC<Props> = ({ value, previousValue, onPress, useSmallerFontSize, setInputValue }) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          caretHidden={true}
          onPressIn={Settings.songSearchRememberPreviousEntry || value ? undefined : onPress}
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
      </View>
    </View>
  );
};

export default SongNumberInput;

const createStyles = ({ isDark, colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: isDark ? "#404040" : "#ddd",
    minWidth: 140
  },
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
