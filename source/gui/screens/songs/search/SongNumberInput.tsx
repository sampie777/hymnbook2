import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Settings from "../../../../settings";
import { isIOS } from "../../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";

type Props = {
  value: string
  previousValue: string
  useSmallerFontSize: boolean
  onPress?: () => void;
};

const SongNumberInput: React.FC<Props> = ({ value, previousValue, onPress, useSmallerFontSize }) => {
  const styles = createStyles(useTheme());

  return <View style={styles.container}>
    <View style={styles.innerContainer}>
      <Text onPress={onPress}
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
    </View>
  </View>;
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
