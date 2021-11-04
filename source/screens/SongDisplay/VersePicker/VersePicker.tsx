import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Dimensions, ScaledSize } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import VersePickerItem, { versePickerItemStyles } from "./VersePickerItem";
import { SongRouteParams, routes } from "../../../navigation";
import { Verse, VerseProps } from "../../../models/Songs";
import HeaderIconButton from "../../../components/HeaderIconButton";
import SongList from "../../../scripts/songs/songList";
import {
  clearOrSelectAll,
  getMarginForVerses,
  isVerseInList,
  toggleVerseInList
} from "../../../scripts/songs/versePicker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface ComponentProps {
  route: any;
  navigation: NativeStackNavigationProp<any>;
}

const VersePicker: React.FC<ComponentProps> = ({ route, navigation }) => {
  const [selectedVerses, setSelectedVerses] = useState<Array<VerseProps>>(route.params.selectedVerses || []);
  const verses: Array<Verse> = route.params.verses || [];
  const songListIndex: number | undefined = route.params.songListIndex;
  const [horizontalMargin, setHorizontalMargin] = useState(
    getMarginForVerses(Dimensions.get("window"),
      styles.verseList.paddingHorizontal,
      versePickerItemStyles.container.minWidth));

  useEffect(() => {
    // Set the callback function for the button in this hook,
    // so the function will use the updated values. Strange behaviour, I know..
    navigation.setOptions({
      headerRight: () => (
        <HeaderIconButton icon={"check"} onPress={submit} />
      )
    });
  }, [selectedVerses]);

  useEffect(() => {
    onFocus();
    return onBlur;
  }, []);

  const onFocus = () => {
    Dimensions.addEventListener("change", handleDimensionsChange);
  };

  const onBlur = () => {
    Dimensions.removeEventListener("change", handleDimensionsChange);
  };

  const handleDimensionsChange = (e: { window: ScaledSize; screen?: ScaledSize; }) => {
    setHorizontalMargin(getMarginForVerses(e.window,
      styles.verseList.paddingHorizontal,
      versePickerItemStyles.container.minWidth));
  };

  const toggleVerse = (verse: VerseProps) => {
    setSelectedVerses(toggleVerseInList(selectedVerses, verse));
  };

  const onItemLongPress = () => {
    setSelectedVerses(clearOrSelectAll(selectedVerses, verses));
  };

  const submit = () => {
    let versesToSubmit = selectedVerses;
    if (versesToSubmit.length === verses.length) {
      versesToSubmit = [];
    }

    if (songListIndex !== undefined) {
      SongList.saveSelectedVersesForSong(songListIndex, versesToSubmit);
    }

    navigation.navigate({
      name: routes.Song,
      params: {
        selectedVerses: versesToSubmit
      } as SongRouteParams,
      merge: true // Navigate 'back'
    });
  };

  return (<View style={styles.container}>
    {verses !== undefined ? undefined : <Text>Failed to load verses</Text>}
    <ScrollView contentContainerStyle={styles.verseList}>
      {verses?.map((it: VerseProps) => <VersePickerItem verse={it}
                                                        key={it.id}
                                                        isSelected={isVerseInList(selectedVerses, it)}
                                                        horizontalMargin={horizontalMargin}
                                                        onPress={toggleVerse}
                                                        onLongPress={onItemLongPress} />)}
    </ScrollView>
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    paddingVertical: 20
  }
});
