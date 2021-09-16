import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";


export default function LoadingOverlay({ isVisible, text }) {
  if (!isVisible) {
    return null;
  }

  if (text === undefined) {
    text = "Loading...";
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={styles.icon.fontSize} color={styles.icon.color} />
      {text === "" || text === null ? null : <Text style={styles.text}>{text}</Text>}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    backgroundColor: "#ffffffcc",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9,
  },
  icon: {
    fontSize: 80,
    color: "#ccc",
  },
  text: {
    paddingTop: 10,
    fontSize: 16,
    color: "#aaa",
  },
});
