import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, View } from 'react-native';
import { isIOS } from "../../../../logic/utils/utils.ts";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { SongNumberInputTextAndroid, SongNumberInputTextMacBook, } from './SongNumberInputText.tsx';
import DeviceInfo from "react-native-device-info";

type Props = {
  value: string
  previousValue: string
  useSmallerFontSize: boolean
  onPress?: () => void
  setInputValue: Dispatch<SetStateAction<string>>
};

const SongNumberInput: React.FC<Props> = ({ value, previousValue, onPress, useSmallerFontSize, setInputValue }) => {
  const styles = createStyles(useTheme());

  const TextLabelElement = isIOS && DeviceInfo.getDeviceType() == "Desktop"
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
