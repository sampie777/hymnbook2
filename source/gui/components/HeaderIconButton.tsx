import React, { ReactElement } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "./ThemeProvider";

interface ComponentProps {
  icon: string | ReactElement;
  iconOverlay?: string | ReactElement;
  onPress?: () => void;
  onLongPress?: () => void;
}

const HeaderIconButton: React.FC<ComponentProps> = ({ icon, iconOverlay, onPress, onLongPress }) => {
  const styles = createStyles(useTheme());

  if (typeof icon === "string") {
    icon = <Icon name={icon} style={styles.icon} />;
  }
  if (typeof iconOverlay === "string") {
    iconOverlay = <Icon name={iconOverlay} style={[styles.icon, styles.iconOverlay]} />;
  }

  return <TouchableOpacity onPress={onPress}
                           onLongPress={onLongPress}
                           style={styles.container}>
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
    color: colors.text
  },
  iconOverlay: {
    position: "absolute",
    top: 12,
    left: 12
  }
});
