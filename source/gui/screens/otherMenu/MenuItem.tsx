import React from "react";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity } from "react-native";

interface MenuItemProps {
  name: string;
  icon?: (style?: StyleProp<TextStyle> | undefined) => React.ReactNode
  onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
                                             name,
                                             icon,
                                             onPress,
                                           }) => {
  const styles = createStyles(useTheme());
  return (<TouchableOpacity onPress={onPress} style={styles.container}>
    {icon?.(styles.icon)}
    <Text style={styles.title}>{name}</Text>
  </TouchableOpacity>);
};

export default MenuItem;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderBottomWidth: 1,
    alignItems: "center",
    paddingLeft: 15,
  },
  title: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 18,
    fontSize: 15,
    color: colors.text,
  },
  icon: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: "center",
    width: 30,
  },
});
