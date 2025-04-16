import React, { Dispatch, memo, SetStateAction } from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';
import { BackspaceKey, ClearKey, NumberKey } from "./InputKey";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import config from "../../../../config";

type Props = {
  useSmallerFontSize: boolean
  extraStylesContainer?: StyleProp<ViewStyle>
  setInputValue: Dispatch<SetStateAction<string>>
};

const KeyPad: React.FC<Props> = ({
                                   useSmallerFontSize,
                                   extraStylesContainer,
                                   setInputValue
                                 }) => {
  const styles = createStyles();

  // Use `previousValue`, so we don't have to use the `inputValue` state directly,
  // which causes unnecessary component updates.
  const onNumberKeyPress = (number: number) =>
    setInputValue((prev) =>
      prev.length >= config.maxSearchInputLength ?
        prev : prev + number
    );

  const onDeleteKeyPress = () =>
    setInputValue(prev => prev.length <= 1 ? "" : prev.substring(0, prev.length - 1))

  const onClearKeyPress = () => setInputValue("");

  return <View style={[styles.container,
    (!useSmallerFontSize ? {} : styles.containerSmaller),
    extraStylesContainer
  ]}>
    <View style={styles.row}>
      <NumberKey number={1} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
      <NumberKey number={2} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
      <NumberKey number={3} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
    </View>
    <View style={styles.row}>
      <NumberKey number={4} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
      <NumberKey number={5} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
      <NumberKey number={6} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
    </View>
    <View style={styles.row}>
      <NumberKey number={7} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
      <NumberKey number={8} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
      <NumberKey number={9} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
    </View>
    <View style={styles.row}>
      <ClearKey onPress={onClearKeyPress} useSmallerFontSize={useSmallerFontSize} />
      <NumberKey number={0} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
      <BackspaceKey onPress={onDeleteKeyPress}
                    onLongPress={onClearKeyPress}
                    useSmallerFontSize={useSmallerFontSize} />
    </View>
  </View>;
};

export default memo(KeyPad);

const createStyles = () => StyleSheet.create({
  container: {
    height: 275,
    minHeight: "40%",
    maxHeight: "50%"
  },
  containerSmaller: {
    height: 230
  },
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "stretch"
  }
});
