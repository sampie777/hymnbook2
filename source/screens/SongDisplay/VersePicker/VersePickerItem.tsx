import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Verse } from "../../../models/Songs";

interface ComponentProps {
  verse: Verse;
  isSelected?: boolean;
  onPress?: (verse: Verse) => void;
}

const VersePickerItem: React.FC<ComponentProps> = ({
                                                     verse,
                                                     isSelected = false,
                                                     onPress
                                                   }) => {

  if (verse.name.trim() === "") {
    return null;
  }

  // Shorten names
  const displayName = verse.name.trim()
    .replace(/verse */gi, "V")
    .replace(/chorus */gi, "C")
    .replace(/bridge */gi, "B")
    .replace(/end */gi, "B")

  return (<TouchableOpacity style={[styles.container, (!isSelected ? {} : styles.containerSelected)]}
                            onPress={() => onPress?.(verse)}>
    <Text style={[styles.text, (!isSelected ? {} : styles.textSelected)]}>
      {displayName}
    </Text>
  </TouchableOpacity>);
};

export default VersePickerItem;


const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 5,
  },
  containerSelected: {},

  text: {
    borderWidth: 1,
    borderRadius: 3,
    borderColor: "#bbb",
    paddingHorizontal: 12,
    paddingVertical: 13,
    minHeight: 47,
    minWidth: 50,
    fontSize: 14,
    textAlign: "center",
    color: "#373737"
  },
  textSelected: {
    backgroundColor: "dodgerblue",
    color: "#fff",
    borderColor: "#167fe5"
  }
});
