import React, { useState } from "react";
import Settings from "../../../settings";
import { capitalize, isIOS } from "../../../logic/utils";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import SliderComponent from "../../components/popups/SliderComponent";

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
                  thumbColor={styles.switchComponent.color}
                  value={_value} />}
      </View>
    );
  };

export const SettingsSliderComponent: React.FC<SettingProps & { defaultValue?: number }> =
  ({
     title,
     description,
     keyName,
     value,
     onPress,
     valueRender,
     isVisible = true,
     lessObviousStyling = false,
     defaultValue
   }) => {
    if (!isVisible) {
      return null;
    }

    const [showSlider, setShowSlider] = useState(false);

    if (value === undefined && keyName !== undefined) {
      value = Settings.get(keyName);
    }

    // Keep new value in memory over state changes
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

    const defaultOnPress = () => {
      setShowSlider(true);
    };

    return (<>
      {!showSlider ? undefined :
        <SliderComponent title={title}
                         description={description}
                         initialValue={Math.round(_value * 100)}
                         onCompleted={value => {
                           setValue(value / 100);
                           setShowSlider(false);
                           if (keyName !== undefined) {
                             _setValue(Settings.get(keyName));
                           }
                         }}
                         onDenied={() => setShowSlider(false)}
                         defaultValue={defaultValue === undefined ? undefined : defaultValue * 100} />
      }
      <SettingComponent title={title}
                        keyName={keyName}
                        value={_value}
                        isVisible={isVisible}
                        onPress={onPress === undefined ? defaultOnPress : onPress}
                        valueRender={valueRender === undefined ? undefined : () => valueRender?.(_value)}
                        lessObviousStyling={lessObviousStyling} />
    </>);
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
  },
  switchComponent: {
    color: isIOS ? "#fff" : colors.primary
  }
});
