import React from "react";
import { ThemeContextProps, useTheme } from "./ThemeProvider";
import { Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, Text, View } from "react-native";

interface Props {
  text?: string;
  iconSource?: ImageSourcePropType;
  iconSize?: number;
  iconStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<ImageStyle>;
}

const IconLabel: React.FC<Props> = ({ text, iconSource, iconSize = 60, iconStyle, textStyle }) => {
  const styles = createStyles(useTheme(), iconSize);
  return <View style={styles.container}>
    <Text style={[styles.text, textStyle]}>
      {text}
    </Text>
    <Image source={iconSource} style={[styles.icon, iconStyle]} />
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps, iconSize = 60) => StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center"
  },
  icon: {
    height: iconSize,
    width: iconSize,
    backgroundColor: "#d7dcfa",
    borderRadius: iconSize,
    borderColor: colors.primaryLight,
    left: -(iconSize / 2)
  },
  text: {
    backgroundColor: colors.primaryLight,
    color: colors.onPrimary,
    fontWeight: "bold",
    paddingVertical: 15,
    paddingRight: 30,
    paddingLeft: iconSize + 15,
    left: (iconSize / 2),
    borderRadius: iconSize
  }
});

export default IconLabel;
