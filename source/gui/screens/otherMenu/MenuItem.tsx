import React from "react";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View } from "react-native";
import { useAppContext } from "../../components/providers/AppContextProvider";

interface MenuItemProps {
  text: string;
  icon?: (style?: StyleProp<TextStyle> | undefined) => React.ReactNode;
  onPress?: () => void;
  hasNotification?: boolean;
  statusIcon?: React.ReactNode;
  isDeveloperOnly?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
                                             text,
                                             icon,
                                             onPress,
                                             hasNotification,
                                             statusIcon,
                                             isDeveloperOnly,
                                           }) => {
  const styles = createStyles(useTheme());
  const appContext = useAppContext();

  if (isDeveloperOnly && !appContext.developerMode) return null;

  return <TouchableOpacity onPress={onPress}
                           style={[styles.container, isDeveloperOnly ? styles.containerDeveloperMode : {}]}>
    <View style={styles.iconContainer}>
      {icon?.(styles.icon)}
      {!hasNotification ? null : <View style={styles.badge}></View>}
    </View>
    <Text style={styles.title}
          importantForAccessibility={"auto"}>
      {text}
    </Text>
    {statusIcon}
  </TouchableOpacity>
};

export default MenuItem;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface1,
    borderColor: colors.border.default,
    borderBottomWidth: 1,
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 15,
  },
  containerDeveloperMode: {
    backgroundColor: "rgba(255,73,0,0.23)"
  },
  title: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 18,
    fontSize: 15,
    color: colors.text.default
  },

  iconContainer: {
    width: 30,
    position: "relative"
  },
  icon: {
    fontSize: 18,
    color: colors.text.light,
    textAlign: "center"
  },
  badge: {
    position: "absolute",
    backgroundColor: colors.text.warning,
    width: 8,
    height: 8,
    borderRadius: 8,
    top: 0,
    right: 2,
    zIndex: 2,
    elevation: 2
  }
});
