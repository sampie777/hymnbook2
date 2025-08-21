import React, { Dispatch, SetStateAction } from 'react';
import {NativeModules, StyleSheet, View} from 'react-native';
import { isIOS } from "../../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import {
  SongNumberInputTextAndroid,
  SongNumberInputTextMacBook,
} from './SongNumberInputText.tsx';

type Props = {
  value: string
  previousValue: string
  useSmallerFontSize: boolean
  onPress?: () => void
  setInputValue: Dispatch<SetStateAction<string>>
};

const SongNumberInput: React.FC<Props> = ({ value, previousValue, onPress, useSmallerFontSize, setInputValue }) => {
  const styles = createStyles(useTheme());

  const TextLabelElement = isIOS && NativeModules.PlatformConstants.interfaceIdiom != "phone"
    ? SongNumberInputTextMacBook
    : SongNumberInputTextAndroid;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TextLabelElement
          value={value}
          previousValue={previousValue}
          useSmallerFontSize={useSmallerFontSize}
          onPress={onPress}
          setInputValue={setInputValue}
          />
      </View>
    </View>
  );
};

export default SongNumberInput;

const createStyles = ({ isDark }: ThemeContextProps) => StyleSheet.create({
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
});
