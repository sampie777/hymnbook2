import React from "react";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View } from "react-native";

interface MenuItemProps {
  text: string;
  icon?: (style?: StyleProp<TextStyle> | undefined) => React.ReactNode;
  onPress?: () => void;
  hasNotification?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
                                             text,
                                             icon,
                                             onPress,
                                             hasNotification
                                           }) => {
  const styles = createStyles(useTheme());
  return (<TouchableOpacity onPress={onPress} style={styles.container}>
    <View style={styles.iconContainer}>
      {icon?.(styles.icon)}
      {!hasNotification ? null : <View style={styles.badge}></View>}
    </View>
    <Text style={styles.title}>{text}</Text>
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
    paddingLeft: 15
  },
  title: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 18,
    fontSize: 15,
    color: colors.text
  },

  iconContainer: {
    width: 30,
    position: "relative"
  },
  icon: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: "center"
  },
  badge: {
    position: "absolute",
    backgroundColor: "#ff2f00",
    width: 8,
    height: 8,
    borderRadius: 8,
    top: 0,
    right: 2,
    zIndex: 2,
    elevation: 2
  }
});
