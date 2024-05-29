import React from "react";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider";
import { StyleSheet, Switch, Text, TouchableWithoutFeedback, View } from "react-native";

interface Props {
  title: string;
  value?: any;
  description?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  valueRender?: (value: any) => string;
  isVisible?: boolean;
}

export const SwitchComponent: React.FC<Props> =
  ({
     title,
     description,
     value,
     onPress = undefined,
     onLongPress = undefined,
     isVisible = true
   }) => {
    if (!isVisible) {
      return null;
    }

    const styles = createStyles(useTheme());

    if (typeof value !== "boolean") {
      console.warn("Using boolean switch component for non boolean value:", {
        title: title,
        description: description,
        value: value,
        valueType: typeof value
      });
    }

    return <TouchableWithoutFeedback onLongPress={onLongPress}>
      <View style={[styles.container, styles.switchContainer]}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {description === undefined ? undefined : <Text style={styles.descriptionText}>{description}</Text>}
        </View>
        {value === undefined ? undefined :
          <Switch onValueChange={onPress}
                  trackColor={{ true: undefined, false: styles.switchComponent.backgroundColor }}
                  thumbColor={styles.switchComponent.color}
                  ios_backgroundColor={styles.switchComponent.backgroundColor}
                  value={value} />}
      </View>
    </TouchableWithoutFeedback>;
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
    color: colors.text.default
  },
  descriptionText: {
    color: colors.text.light,
    fontSize: 14,
    paddingTop: 5,
    fontStyle: "italic"
  },
  valueText: {
    color: colors.text.light,
    fontSize: 14,
    paddingTop: 5
  },
  switchComponent: {
    color: colors.switchComponent.thumb,
    backgroundColor: colors.switchComponent.background
  }
});
