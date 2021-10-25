import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SongVerse } from "../../../models/ServerSongsModel";
import { FlatList } from "react-native-gesture-handler";
import VersePickerItem from "./VersePickerItem";

interface ComponentProps {
  verses: Array<SongVerse>;
  initialSelection: Array<SongVerse>;
  onSubmit?: (selection: Array<SongVerse>) => void;
  onCancel?: () => void;
}

const VersePicker: React.FC<ComponentProps> = ({
                                                 verses,
                                                 initialSelection,
                                                 onSubmit,
                                                 onCancel
                                               }) => {

  const [selection, setSelection] = useState<Array<SongVerse>>(initialSelection);

  const toggleVerse = (verse: SongVerse) => {
    let newSelection: Array<SongVerse>;
    if (isVerseListed(verse)) {
      newSelection = selection.filter(it => it.id !== verse.id);
    } else {
      newSelection = selection.concat(verse);
    }

    newSelection = newSelection.sort((a, b) => a.index - b.index)
    setSelection(newSelection);
  };

  const isVerseListed = (verse: SongVerse): boolean => {
    return selection.includes(verse);
  };

  const renderVersePickerItem = ({ item }: { item: SongVerse }) => (
    <VersePickerItem verse={item}
                     isSelected={isVerseListed(item)}
                     onPress={toggleVerse} />
  );

  return (<View style={styles.container}>
    <FlatList data={verses}
              renderItem={renderVersePickerItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.verseList} />
  </View>);
};

export default VersePicker;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch"
  },

  verseList: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "wrap"
  }
});
