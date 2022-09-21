import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "react-native-screens/src/native-stack/types";
import Db from "../../../../../logic/db/db";
import { SongSchema } from "../../../../../logic/db/models/SongsSchema";
import { rollbar } from "../../../../../logic/rollbar";
import { routes, ParamList, VersePickerMethod } from "../../../../../navigation";
import { Song, Verse, VerseProps } from "../../../../../logic/db/models/Songs";
import SongList from "../../../../../logic/songs/songList";
import {
  clearOrSelectAll,
  getMarginForVerses,
  isVerseInList,
  toggleVerseInList
} from "../../../../../logic/songs/versePicker";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";
import { StyleSheet, View, Text, Dimensions, ScaledSize, ScrollView } from "react-native";
import HeaderIconButton from "../../../../components/HeaderIconButton";
import VersePickerItem, { versePickerItemStyles as createVersePickerItemStyles } from "./VersePickerItem";

interface ComponentProps extends NativeStackScreenProps<ParamList, "VersePicker"> {
}

const VersePicker: React.FC<ComponentProps> = ({ route, navigation }) => {
  const [selectedVerses, setSelectedVerses] = useState<Array<VerseProps>>(route.params.selectedVerses || []);
  const verses: Array<Verse> = route.params.verses || [];
  const songListIndex: number | undefined = route.params.songListIndex;
  const styles = createStyles(useTheme());
  const versePickerItemStyles = createVersePickerItemStyles(useTheme());
  const [horizontalMargin, setHorizontalMargin] = useState(
    getMarginForVerses(Dimensions.get("window"),
      styles.verseList.paddingHorizontal,
      versePickerItemStyles.container.minWidth));

  useEffect(() => {
    // Set the callback function for the button in this hook,
    // so the function will use the updated values. Strange behaviour, I know..
    navigation.setOptions({
      headerRight: () => <HeaderIconButton icon={"check"} onPress={submit} />
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

    switch (route.params.method) {
      case VersePickerMethod.UpdatePossibleSongListAndGoBackToSong:
        updatePossibleSongListAndGoBackToSong(versesToSubmit);
        break;
      case VersePickerMethod.ShowSong:
        showSong(versesToSubmit);
        break;
      case VersePickerMethod.AddToSongListAndShowSearch:
        addToSongListAndShowSearch(versesToSubmit);
        break;
    }
  };

  const updatePossibleSongListAndGoBackToSong = (verses: Verse[]) => {
    if (songListIndex !== undefined) {
      SongList.saveSelectedVersesForSong(songListIndex, verses);
    }

    navigation.navigate({
      name: routes.Song,
      params: {
        selectedVerses: verses
      },
      merge: true // Navigate 'back'
    });
  };

  const showSong = (verses: Verse[]) => {
    navigation.replace(routes.Song, {
      id: route.params.songId,
      selectedVerses: verses
    });
  };

  const addToSongListAndShowSearch = (verses: Verse[]) => {
    if (route.params.songId === undefined) {
      return;
    }

    const song = Db.songs.realm()
      .objectForPrimaryKey(SongSchema.name, route.params.songId) as (Song & Realm.Object | undefined);

    if (song === undefined) {
      return;
    }

    let addedSongListSongModel;
    try {
      addedSongListSongModel = SongList.addSong(song);
    } catch (e: any) {
      rollbar.error(`Failed to add song ([${song.id}] ${song.name}) to songlist: ${e}`, e);
      alert("Could not add song to songlist: " + e);
      return;
    }
    if (addedSongListSongModel === undefined) {
      return;
    }

    SongList.saveSelectedVersesForSong(addedSongListSongModel.index, verses);

    navigation.navigate(routes.SongSearch);
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


const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.background
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
