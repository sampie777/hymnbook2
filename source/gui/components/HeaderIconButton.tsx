import React, { ReactElement } from "react";
import { Insets, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { ThemeContextProps, useTheme } from "./providers/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";

interface ComponentProps {
  icon: string | ReactElement;
  iconOverlay?: string | ReactElement;
  onPress?: () => void;
  onLongPress?: () => void;
  buttonStyle?: StyleProp<ViewStyle> | undefined;
  hitSlop?: Insets;
  accessibilityLabel?: string;
}

const HeaderIconButton: React.FC<ComponentProps> = ({
                                                      icon,
                                                      iconOverlay,
                                                      onPress,
                                                      onLongPress,
                                                      buttonStyle,
                                                      hitSlop,
                                                      accessibilityLabel,
                                                    }) => {
  const styles = createStyles(useTheme());

  if (typeof icon === "string") {
    icon = <Icon name={icon} style={styles.icon} />;
  }
  if (typeof iconOverlay === "string") {
    iconOverlay = <Icon name={iconOverlay} style={[styles.icon, styles.iconOverlay]} />;
  }

  return <TouchableOpacity onPress={onPress}
                           onLongPress={onLongPress}
                           style={[styles.container, buttonStyle]}
                           hitSlop={hitSlop}
                           accessibilityLabel={accessibilityLabel}>
    {icon}
    {iconOverlay}
  </TouchableOpacity>;
};

export default HeaderIconButton;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  icon: {
    fontSize: 20,
    color: colors.text.default
  },
  iconOverlay: {
    position: "absolute",
    top: 12,
    left: 12
  }
});
