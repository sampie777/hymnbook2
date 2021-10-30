import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Verse } from "../../../models/Songs";
import { getVerseType, VerseType } from "../../../scripts/songs/utils";

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

  const styleForVerseType = (type: VerseType) => {
    switch (type) {
      case VerseType.Chorus:
        return styles.chorus;
      case VerseType.Bridge:
        return styles.bridge;
      case VerseType.Intro:
        return styles.intro;
      case VerseType.End:
        return styles.end;
    }
  };

  // Shorten names
  const displayName = verse.name.trim()
    .replace(/verse */gi, "")
    .replace(/chorus */gi, "C")
    .replace(/bridge */gi, "B")
    .replace(/intro */gi, "I")
    .replace(/end */gi, "E")

  return (<TouchableOpacity style={[
    styles.container,
    styleForVerseType(getVerseType(verse)),
    (!isSelected ? {} : styles.containerSelected)
  ]}
                            onPress={() => onPress?.(verse)}>
    <Text style={[styles.text, (!isSelected ? {} : styles.textSelected)]}>
      {displayName}
    </Text>
  </TouchableOpacity>);
};

export default VersePickerItem;


const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fcfcfc",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 8,
    minHeight: 50,
    minWidth: 50,
    paddingHorizontal: 12,
    borderRadius: 50,
    paddingVertical: 10
  },
  containerSelected: {
    backgroundColor: "dodgerblue",
  },

  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#373737"
  },
  textSelected: {
    color: "#fff",
  },

  intro: {
    backgroundColor: "#b6fdbf"
  },
  chorus: {
    backgroundColor: "#fcd0ff"
  },
  bridge: {
    backgroundColor: "#b7f5ed"
  },
  end: {
    backgroundColor: "#fdd8d8"
  },
});
