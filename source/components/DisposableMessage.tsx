import React  from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface ComponentProps {
  message: string;
  onPress: () => void;
  maxDuration: number;
}

const DisposableMessage: React.FC<ComponentProps>
  = ({ message, onPress, maxDuration }) => {

  if (message === "") {
    return null;
  }

  if (maxDuration > 0) {
    setTimeout(onPress, maxDuration);
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <View style={styles.icon}>
        <Icon name="times-circle" size={styles.icon.fontSize} color={styles.icon.color} />
      </View>
    </TouchableOpacity>
  );
};

export default DisposableMessage;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
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
    paddingRight: 50
  },

  icon: {
    fontSize: 24,
    color: "#555",
    position: "absolute",
    right: 30
  }
});
