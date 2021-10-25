import React from "react";
import { StyleSheet, Text } from "react-native";
import { SongVerse } from "../../../models/ServerSongsModel";
import { TouchableOpacity } from "react-native-gesture-handler";

interface ComponentProps {
  verse: SongVerse;
  isSelected?: boolean;
  onPress?: (verse: SongVerse) => void;
}

const VersePickerItem: React.FC<ComponentProps> = ({
                                                     verse,
                                                     isSelected = false,
                                                     onPress
                                                   }) => {

  if (verse.name.trim() === "") {
    return null;
  }

  return (<TouchableOpacity style={[styles.container, (!isSelected ? {} : styles.containerSelected)]}
                            onPress={() => onPress?.(verse)}>
    <Text>{verse.name}</Text>
  </TouchableOpacity>);
};

export default VersePickerItem;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbb",
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginHorizontal: 5,
    marginVertical: 5
  },
  containerSelected: {
    backgroundColor: "dodgerblue",
    color: "#fff",
    borderColor: "#f00"
  }
});
