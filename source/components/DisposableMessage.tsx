import React  from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "./ThemeProvider";

interface ComponentProps {
  message: string;
  onPress?: (() => void) | undefined;
  maxDuration: number;
}

const DisposableMessage: React.FC<ComponentProps>
  = ({ message, onPress, maxDuration }) => {

  if (message === "") {
    return null;
  }

  const styles = createStyles(useTheme());

  if (maxDuration > 0 && onPress !== undefined) {
    setTimeout(onPress, maxDuration);
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <View style={styles.icon}>
        <Icon name="times-circle" size={styles.icon.fontSize} color={styles.icon.color as string} />
      </View>
    </TouchableOpacity>
  );
};

export default DisposableMessage;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.height8,
    margin: 15,
    marginBottom: 0,
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },

  text: {
    fontSize: 20,
    paddingRight: 50,
    color: colors.text0
  },

  icon: {
    fontSize: 24,
    color: colors.text1,
    position: "absolute",
    right: 30
  }
});
