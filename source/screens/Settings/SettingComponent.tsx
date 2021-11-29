import React, { useState } from "react";
import Settings from "../../scripts/settings";
import { capitalize } from "../../scripts/utils";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

interface SettingProps {
  title: string;
  keyName?: string;
  value?: any;
  description?: string;
  onPress?: (setValue: (newValue: any) => void, key?: string, newValue?: any) => void;
  valueRender?: (value: any) => string;
  isVisible?: boolean;
  lessObviousStyling?: boolean;
}

export const SettingComponent: React.FC<SettingProps> =
  ({
     title,
     description,
     keyName,
     value,
     onPress,
     valueRender,
     isVisible = true,
     lessObviousStyling = false
   }) => {
    if (!isVisible) {
      return null;
    }

    const styles = createStyles(useTheme());

    if (value === undefined && keyName !== undefined) {
      value = Settings.get(keyName);
    }

    const [_value, _setValue] = useState(value);
    const setValue = (newValue: any) => {
      if (keyName !== undefined) {
        // @ts-ignore
        Settings[keyName] = newValue;
        // @ts-ignore
        _setValue(Settings[keyName]);
      } else {
        _setValue(newValue);
      }
    };

    if (valueRender === undefined) {
      valueRender = (it) => {
        if (typeof it === "boolean") {
          return capitalize(it.toString());
        }
        return it.toString();
      };
    }

    return (
      <TouchableOpacity
        style={[styles.container, (lessObviousStyling ? {} : styles.whiteContainer)]}
        onPress={onPress === undefined ? undefined : () => onPress(setValue, keyName)}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        {description === undefined ? undefined : <Text style={styles.descriptionText}>{description}</Text>}
        {value === undefined ? undefined : <Text style={styles.valueText}>{valueRender(_value)}</Text>}
      </TouchableOpacity>
    );
  };

export const SettingSwitchComponent: React.FC<SettingProps> =
  ({
     title,
     description,
     keyName,
     value,
     onPress = undefined,
     isVisible = true,
     lessObviousStyling = false
   }) => {
    if (!isVisible) {
      return null;
    }

    const styles = createStyles(useTheme());

    if (value === undefined && keyName !== undefined) {
      value = Settings.get(keyName);
    }

    if (onPress === undefined) {
      onPress = (setValue, key, newValue) => setValue(newValue);
    }

    const [_value, _setValue] = useState(value);
    const setValue = (newValue: any) => {
      if (keyName !== undefined) {
        // @ts-ignore
        Settings[keyName] = newValue;
        // @ts-ignore
        _setValue(Settings[keyName]);
      } else {
        _setValue(newValue);
      }
    };

    if (typeof _value !== "boolean") {
      console.warn("Using boolean switch component for non boolean setting:", keyName, _value);
    }

    return (
      <View style={[styles.container, styles.switchContainer, (lessObviousStyling ? {} : styles.whiteContainer)]}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {description === undefined ? undefined : <Text style={styles.descriptionText}>{description}</Text>}
        </View>
        {value === undefined ? undefined :
          <Switch onValueChange={(newValue) => onPress?.(setValue, keyName, newValue)}
                  thumbColor={"dodgerblue"}
                  value={_value} />}
      </View>
    );
  };


const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 1,
    backgroundColor: colors.background
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  whiteContainer: {
    backgroundColor: isDark ? colors.background : colors.surface1,
    borderColor: colors.border,
    borderBottomWidth: 1
  },

  titleContainer: {
    flex: 1
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
  }
});
