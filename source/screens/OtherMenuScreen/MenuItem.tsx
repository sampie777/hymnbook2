import React from "react";
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
  return (<TouchableOpacity onPress={onPress} style={styles.container}>
    {icon?.(styles.icon)}
    <Text style={styles.title}>{name}</Text>
  </TouchableOpacity>);
};

export default MenuItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderColor: "#ddd",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  title: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 18,
    fontSize: 15,
  },
  icon: {
    marginLeft: 15,
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    width: 30,
  },
});
