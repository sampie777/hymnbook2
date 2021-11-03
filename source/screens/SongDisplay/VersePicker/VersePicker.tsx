import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import VersePickerItem from "./VersePickerItem";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { SongRouteParams, routes } from "../../../navigation";
import { Verse, VerseProps } from "../../../models/Songs";
import HeaderIconButton from "../../../components/HeaderIconButton";
import SongList from "../../../scripts/songs/songList";

interface ComponentProps {
  route: any;
  navigation: DrawerNavigationProp<any>;
}

const VersePicker: React.FC<ComponentProps> = ({ route, navigation }) => {
  const [selectedVerses, setSelectedVerses] = useState<Array<VerseProps>>(route.params.selectedVerses || []);
  const verses: Array<Verse> = route.params.verses || [];
  const songListIndex: number | undefined = route.params.songListIndex;

  useEffect(() => {
    // Set the callback function for the button in this hook,
    // so the function will use the updated values. Strange behaviour, I know..
    navigation.setOptions({
      headerRight: () => (
        <HeaderIconButton icon={"check"} onPress={submit} />
      )
    });
  }, [selectedVerses]);

  const toggleVerse = (verse: VerseProps) => {
    let newSelection: Array<VerseProps>;
    if (isVerseListed(verse)) {
      newSelection = selectedVerses.filter(it => it.id !== verse.id);
    } else {
      newSelection = selectedVerses.concat(verse);
    }

    newSelection = newSelection.sort((a, b) => a.index - b.index);
    setSelectedVerses(newSelection);
  };

  const clearOrSelectAll = () => {
    if (selectedVerses.length > 0) {
      setSelectedVerses([]);
    } else {
      setSelectedVerses(verses);
    }
  };

  const isVerseListed = (verse: VerseProps): boolean => {
    return selectedVerses.some(it => it.id === verse.id);
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
                                                        isSelected={isVerseListed(it)}
                                                        onPress={toggleVerse}
                                                        onLongPress={clearOrSelectAll} />)}
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
    paddingHorizontal: 20,
    paddingVertical: 20
  }
});
