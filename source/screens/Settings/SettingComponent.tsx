import React, { useState } from "react";
import Settings from "../../scripts/settings";
import { capitalize } from "../../scripts/utils";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface SettingProps {
  name: string;
  sKey?: string;
  value?: any;
  onPress?: (setValue: (newValue: any) => void, key?: string, newValue?: any) => void;
  valueRender?: (value: any) => string;
}

export const SettingComponent: React.FC<SettingProps> =
  ({ name, sKey, value, onPress = undefined, valueRender = undefined }) => {

    if (value === undefined && sKey !== undefined) {
      value = Settings.get(sKey);
    }

    const [_value, _setValue] = useState(value);
    const setValue = (newValue: any) => {
      if (sKey !== undefined) {
        // @ts-ignore
        Settings[sKey] = newValue;
        // @ts-ignore
        _setValue(Settings[sKey]);
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
        style={styles.container}
        onPress={onPress === undefined ? undefined : () => onPress(setValue, sKey)}>
        <Text style={styles.keyText}>{name}</Text>
        {value === undefined ? undefined : <Text style={styles.valueText}>{valueRender(_value)}</Text>}
      </TouchableOpacity>
    );
  };

export const SettingSwitchComponent: React.FC<SettingProps> =
  ({ name, sKey, value, onPress = undefined }) => {

    if (value === undefined && sKey !== undefined) {
      value = Settings.get(sKey);
    }

    const [_value, _setValue] = useState(value);
    const setValue = (newValue: any) => {
      if (sKey !== undefined) {
        // @ts-ignore
        Settings[sKey] = newValue;
        // @ts-ignore
        _setValue(Settings[sKey]);
      } else {
        _setValue(newValue);
      }
    };

    if (typeof _value !== "boolean") {
      console.warn("Using boolean switch component for non boolean setting:", sKey, _value);
    }

    return (
      <View style={[styles.container, styles.switchContainer]}>
        <Text style={styles.keyText}>{name}</Text>
        {value === undefined ? undefined :
          <Switch onValueChange={onPress === undefined ? undefined :
            (newValue) => onPress(setValue, sKey, newValue)}
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
    backgroundColor: "#fcfcfc",
    borderColor: "#ddd",
    borderBottomWidth: 1
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  keyText: {
    fontSize: 16
  },
  valueText: {
    color: "#555",
    fontSize: 14,
    paddingLeft: 10,
    paddingTop: 5
  }
});
