import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HeaderIconButton from "../../../components/HeaderIconButton";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";

interface Props {
  onPress: () => void;

}

const HeaderIconVersePicker: React.FC<Props> = ({ onPress }) => {
  // const styles = createStyles(useTheme());

  return <>
    {/*<TouchableOpacity onPress={onPress} style={styles.verseSelectButton}>*/}
    {/*<Text style={[styles.verseSelectButtonText, styles.verseSelectButtonTextSelect]}>select</Text>*/}
    {/*<Text style={styles.verseSelectButtonText}>verses</Text>*/}
    {/*</TouchableOpacity>*/}
    <HeaderIconButton icon={"list-ol"}
                      onPress={onPress} />
  </>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  verseSelectButton: {
    alignItems: "center"
  },
  verseSelectButtonText: {
    fontSize: 17,
    color: colors.text,
    paddingHorizontal: 7,
    lineHeight: 17
  },
  verseSelectButtonTextSelect: {
    color: colors.textLight,
    fontSize: 13,
    lineHeight: 14
  }
});

export default HeaderIconVersePicker;
