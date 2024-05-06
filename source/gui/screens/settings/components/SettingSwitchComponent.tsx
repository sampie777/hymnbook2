import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import Settings from "../../../../settings";
import { BaseSettingProps, createStyles as settingComponentCreateStyles } from "./SettingComponent";

interface BooleanSettingProps extends BaseSettingProps<boolean> {
  onPress?: (setValue: (newValue: boolean) => void, key: string | undefined, newValue: boolean) => void;
}

const SettingSwitchComponent: React.FC<BooleanSettingProps> = ({
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
    console.warn("Using boolean switch component for non boolean setting:", keyName, _value);
  }

  return (
    <View style={[baseStyles.container, styles.switchContainer, (lessObviousStyling ? {} : baseStyles.whiteContainer)]}>
      <View style={baseStyles.titleContainer}>
        <Text style={baseStyles.titleText}>{title}</Text>
        {description === undefined ? undefined : <Text style={baseStyles.descriptionText}>{description}</Text>}
      </View>
      {value === undefined ? undefined :
        <Switch onValueChange={(newValue) => onPress?.(setValue, keyName, newValue)}
                trackColor={{ true: undefined, false: styles.switchComponent.backgroundColor }}
                thumbColor={styles.switchComponent.color}
                ios_backgroundColor={styles.switchComponent.backgroundColor}
                value={_value} />}
    </View>
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
