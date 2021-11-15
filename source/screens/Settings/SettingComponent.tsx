import React, { useState } from "react";
import Settings from "../../scripts/settings";
import { capitalize } from "../../scripts/utils";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface SettingProps {
  title: string;
  keyName?: string;
  value?: any;
  onPress?: (setValue: (newValue: any) => void, key?: string, newValue?: any) => void;
  valueRender?: (value: any) => string;
  isVisible?: boolean;
  lessObviousStyling?: boolean;
}

export const SettingComponent: React.FC<SettingProps> =
  ({
     title,
     keyName,
     value,
     onPress = undefined,
     valueRender = undefined,
     isVisible = true,
     lessObviousStyling = false,
   }) => {
    if (!isVisible) {
      return null;
    }

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
        <Text style={styles.titleText}>{title}</Text>
        {value === undefined ? undefined : <Text style={styles.valueText}>{valueRender(_value)}</Text>}
      </TouchableOpacity>
    );
  };

export const SettingSwitchComponent: React.FC<SettingProps> =
  ({ title,
     keyName,
     value,
     onPress = undefined,
     isVisible = true,
     lessObviousStyling = false,
   }) => {
    if (!isVisible) {
      return null;
    }

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
        <Text style={styles.titleText}>{title}</Text>
        {value === undefined ? undefined :
          <Switch onValueChange={(newValue) => onPress?.(setValue, keyName, newValue)}
                  thumbColor={"dodgerblue"}
                  value={_value} />}
      </View>
    );
  };


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 1,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  whiteContainer: {
    backgroundColor: "#fcfcfc",
    borderColor: "#ddd",
    borderBottomWidth: 1,
  },

  titleText: {
    fontSize: 16,
    flex: 1
  },
  valueText: {
    color: "#555",
    fontSize: 14,
    paddingLeft: 10,
    paddingTop: 5
  }
});
