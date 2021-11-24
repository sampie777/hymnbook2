import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

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
    backgroundColor: colors.height1,
    borderColor: colors.border0,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  title: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 18,
    fontSize: 15,
    color: colors.text0,
  },
  icon: {
    marginLeft: 15,
    fontSize: 18,
    color: colors.text1,
    textAlign: "center",
    width: 30,
  },
});
