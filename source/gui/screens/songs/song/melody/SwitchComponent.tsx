import React from "react";
import { isIOS } from "../../../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";
import { StyleSheet, Switch, Text, View } from "react-native";

interface Props {
  title: string;
  value?: any;
  description?: string;
  onPress?: () => void;
  valueRender?: (value: any) => string;
  isVisible?: boolean;
}

export const SwitchComponent: React.FC<Props> =
  ({
     title,
     description,
     value,
     onPress = undefined,
     isVisible = true
   }) => {
    if (!isVisible) {
      return null;
    }

    const styles = createStyles(useTheme());

    if (typeof value !== "boolean") {
      console.warn("Using boolean switch component for non boolean value:", value);
    }

    return <View style={[styles.container, styles.switchContainer]}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
        {description === undefined ? undefined : <Text style={styles.descriptionText}>{description}</Text>}
      </View>
      {value === undefined ? undefined :
        <Switch onValueChange={onPress}
                thumbColor={styles.switchComponent.color}
                value={value} />}
    </View>;
  };

export default SwitchComponent;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingVertical: 10,
    marginBottom: 1
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  titleContainer: {
    flex: 1,
    paddingRight: 5
  },
  titleText: {
    fontSize: 16,
    color: colors.text
  },
  descriptionText: {
    color: colors.textLight,
    fontSize: 14,
    paddingTop: 5,
    fontStyle: "italic"
  },
  valueText: {
    color: colors.textLight,
    fontSize: 14,
    paddingTop: 5
  },
  switchComponent: {
    color: isIOS ? "#fff" : colors.primary
  }
});
