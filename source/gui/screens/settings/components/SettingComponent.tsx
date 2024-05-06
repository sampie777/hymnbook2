import React, { useState } from "react";
import Settings from "../../../../settings";
import { capitalize } from "../../../../logic/utils";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";

export interface BaseSettingProps<T> {
  title: string;
  keyName?: string;
  value?: T;
  description?: string;
  valueRender?: (value: T) => string;
  isVisible?: boolean;
  lessObviousStyling?: boolean;
}

export interface GenericSettingProps<T> extends BaseSettingProps<T> {
  onPress?: (setValue: <T>(newValue: T) => void, key: string | undefined, newValue: T) => void;
  onLongPress?: (setValue: <T>(newValue: T) => void, key: string | undefined, newValue: T) => void;
}

export function SettingComponent<T = string>({
                                               title,
                                               description,
                                               keyName,
                                               value,
                                               onPress,
                                               onLongPress,
                                               valueRender,
                                               isVisible = true,
                                               lessObviousStyling = false
                                             }: GenericSettingProps<T>) {
  if (!isVisible) {
    return null;
  }

  const styles = createStyles(useTheme());

  if (value === undefined && keyName !== undefined) {
    value = Settings.get(keyName);
  }

  const [_value, _setValue] = useState<T>(value as T);
  const setValue = <S, >(newValue: S) => {
    if (keyName !== undefined) {
      // @ts-ignore
      Settings[keyName] = newValue;
      // @ts-ignore
      _setValue(Settings[keyName]);
    } else {
      _setValue(newValue as unknown as T);
    }
  };

  if (valueRender === undefined) {
    valueRender = (it) => {
      if (typeof it === "boolean") {
        return capitalize(it.toString());
      }
      return (it as any).toString();
    };
  }

  return (
    <TouchableOpacity
      style={[styles.container, (lessObviousStyling ? {} : styles.whiteContainer)]}
      onPress={onPress === undefined ? undefined : () => onPress(setValue, keyName, _value)}
      onLongPress={onLongPress === undefined ? undefined : () => onLongPress(setValue, keyName, _value)}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      {description === undefined ? undefined : <Text style={styles.descriptionText}>{description}</Text>}
      {value === undefined ? undefined : <Text style={styles.valueText}>{valueRender(_value)}</Text>}
    </TouchableOpacity>
  );
}

export const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 1,
    backgroundColor: colors.background
  },
  whiteContainer: {
    backgroundColor: isDark ? colors.background : colors.surface1,
    borderColor: colors.border.default,
    borderBottomWidth: 1
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
  }
});
