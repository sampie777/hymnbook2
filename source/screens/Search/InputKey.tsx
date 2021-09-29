import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface KeyProps {
  onPress: () => void;
  extraStyle?: Object;
}

export const Key: React.FC<KeyProps> = ({ children, onPress, extraStyle }) => {
  const keyTextStyle: Array<Object> = [styles.keyText];
  if (extraStyle !== undefined) {
    keyTextStyle.push(extraStyle);
  }

  return (
    <TouchableOpacity style={styles.key}
                      onPress={onPress}>
      <Text style={keyTextStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

export const NumberKey: React.FC<{ number: number, onPress: (number: number) => void }> =
  ({ number, onPress }) => (
    <Key onPress={() => onPress(number)}>
      {number}
    </Key>
  );

export const ClearKey: React.FC<{ onPress: () => void, text?: string }> =
  ({ onPress, text = "Clear" }) => (
    <Key onPress={onPress}
         extraStyle={styles.specialKeyText}>{text}</Key>
  );

export const BackspaceKey: React.FC<{ onPress: () => void }> =
  ({ onPress }) => (
    <Key onPress={onPress}
         extraStyle={styles.specialKeyText}>
      <Icon name="backspace" size={styles.keyText.fontSize - 10} color={styles.keyText.color} />
    </Key>
  );


const styles = StyleSheet.create({
  key: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#eee",
    borderWidth: 1
  },
  keyText: {
    fontSize: 40,
    fontFamily: "sans-serif-thin",
    color: "#888"
  },
  specialKeyText: {
    fontSize: 20,
    fontFamily: "sans-serif-light"
  }
});
