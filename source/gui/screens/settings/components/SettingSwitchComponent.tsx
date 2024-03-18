import React, { useState } from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import Settings from "../../../../settings";
import { BaseSettingProps, createStyles as settingComponentCreateStyles } from "./SettingComponent";

interface BooleanSettingProps extends BaseSettingProps<boolean> {
  onPress?: (setValue: (newValue: boolean) => void, key: string | undefined, newValue: boolean) => void;
  onLongPress?: (setValue: (newValue: boolean) => void, key: string | undefined) => void;
}

const SettingSwitchComponent: React.FC<BooleanSettingProps> = ({
                                                                 title,
                                                                 description,
                                                                 keyName,
                                                                 value,
                                                                 onPress = undefined,
                                                                 onLongPress = undefined,
                                                                 isVisible = true,
                                                                 lessObviousStyling = false
                                                               }) => {
  if (!isVisible) {
    return null;
  }

  const baseStyles = settingComponentCreateStyles(useTheme());
  const styles = createStyles(useTheme());

  if (value === undefined && keyName !== undefined) {
    value = Settings.get(keyName);
  }

  if (onPress === undefined) {
    onPress = (setValue, key, newValue) => setValue(newValue);
  }

  const [_value, _setValue] = useState(value);
  const setValue = (newValue: boolean) => {
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
    console.warn("Using boolean switch component for non boolean setting:", {
      key: keyName,
      value: _value,
      valueType: typeof _value
    });
  }

  return (
    <TouchableWithoutFeedback
      onLongPress={onLongPress === undefined ? undefined : () => onLongPress(setValue, keyName)}>
      <View
        style={[baseStyles.container, styles.switchContainer, (lessObviousStyling ? {} : baseStyles.whiteContainer)]}>
        <View style={baseStyles.titleContainer}>
          <Text style={baseStyles.titleText}>{title}</Text>
          {description === undefined ? undefined : <Text style={baseStyles.descriptionText}>{description}</Text>}
        </View>
        {value === undefined ? undefined :
          <Switch onValueChange={(newValue) => onPress?.(setValue, keyName, newValue)}
                  thumbColor={styles.switchComponent.color}
                  ios_backgroundColor={styles.switchComponent.backgroundColor}
                  value={_value} />}
      </View>
    </TouchableWithoutFeedback>
  );
};


export const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  switchComponent: {
    color: colors.switchComponent.thumb,
    backgroundColor: colors.switchComponent.background
  }
});

export default SettingSwitchComponent;
