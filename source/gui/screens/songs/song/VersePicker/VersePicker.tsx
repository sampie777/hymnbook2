import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { rollbar } from "../../../../../logic/rollbar";
import { generateSongTitle, loadSongWithUuidOrId } from "../../../../../logic/songs/utils";
import { ParamList, SongRoute, VersePickerMethod, VersePickerRoute } from "../../../../../navigation";
import { Verse, VerseProps } from "../../../../../logic/db/models/songs/Songs";
import SongList from "../../../../../logic/songs/songList";
import {
  cleanSelectedVerses,
  clearOrSelectAll,
  getMarginForVerses,
  hasVisibleNameForPicker,
  isVerseInList,
  toggleVerseInList
} from "../../../../../logic/songs/versePicker";
import { RectangularInset } from "../../../../components/utils";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider";
import { Alert, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import HeaderIconButton from "../../../../components/HeaderIconButton";
import VersePickerItem, { versePickerItemStyles as createVersePickerItemStyles } from "./VersePickerItem";
import { sanitizeErrorForRollbar } from "../../../../../logic/utils/utils.ts";

interface ComponentProps extends NativeStackScreenProps<ParamList, typeof VersePickerRoute> {
}

const VersePicker: React.FC<ComponentProps> = ({ route, navigation }) => {
  const verses: Array<Verse> = route.params.verses || [];
  const [selectedVerses, setSelectedVerses] = useState<VerseProps[]>(cleanSelectedVerses(route.params.selectedVerses, verses) || []);
  const songListIndex: number | undefined = route.params.songListIndex;
  const styles = createStyles(useTheme());
  const versePickerItemStyles = createVersePickerItemStyles(useTheme());
  const windowDimension = useWindowDimensions();
  const horizontalMargin = getMarginForVerses(windowDimension,
    styles.scrollView.paddingHorizontal,
    versePickerItemStyles.container.minWidth);

  React.useLayoutEffect(() => {
    // Set the callback function for the button in this hook,
    // so the function will use the updated values. Strange behaviour, I know..
    navigation.setOptions({
      headerRight: () => <HeaderIconButton icon={"check"}
                                           onPress={submit}
                                           hitSlop={RectangularInset(10)}
                                           accessibilityLabel={"Done"} />
    });
  }, [selectedVerses]);

  const toggleVerse = (verse: VerseProps) => {
    setSelectedVerses(toggleVerseInList(selectedVerses, verse));
  };

  const onItemLongPress = () => {
    setSelectedVerses(clearOrSelectAll(selectedVerses, verses));
  };

  const submit = () => {
    switch (route.params.method) {
      case VersePickerMethod.UpdatePossibleSongListAndGoBackToSong:
        updatePossibleSongListAndGoBackToSong(selectedVerses);
        break;
      case VersePickerMethod.ShowSong:
        showSong(selectedVerses);
        break;
      case VersePickerMethod.AddToSongListAndShowSearch:
        addToSongListAndShowSearch(selectedVerses);
        break;
    }
  };

  const updatePossibleSongListAndGoBackToSong = (verses: Verse[]) => {
    if (songListIndex !== undefined) {
      SongList.saveSelectedVersesForSong(songListIndex, verses);
    }

    navigation.popTo(SongRoute, {
        selectedVerses: verses,
        highlightText: route.params.highlightText
      },
      {
        merge: true // Retrain song screen original parameters (like uuid)
      });
  };

  const showSong = (verses: Verse[]) => {
    navigation.replace(SongRoute, {
      id: route.params.songId,
      uuid: route.params.songUuid,
      selectedVerses: verses,
      highlightText: route.params.highlightText
    });
  };

  const addToSongListAndShowSearch = (verses: Verse[]) => {
    const song = loadSongWithUuidOrId(route.params.songUuid, route.params.songId);
    if (song === undefined) return;

    let addedSongListSongModel;
    try {
      addedSongListSongModel = SongList.addSong(song);
    } catch (error) {
      rollbar.error(`Failed to add song to songlist`, {
        ...sanitizeErrorForRollbar(error),
        song: song,
        callFrom: "VersePicker"
      });
      Alert.alert("Could not add song to songlist: " + error);
      return;
    }

    if (addedSongListSongModel === undefined) return;

    SongList.saveSelectedVersesForSong(addedSongListSongModel.index, verses);

    navigation.pop();
  };

  const songTitleWithVerses = route.params.songName == null ? undefined :
    generateSongTitle({
      name: route.params.songName,
      verses: route.params.verses
    }, selectedVerses);

  return <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollView}>
      {songTitleWithVerses === undefined ? undefined : <Text style={styles.text}>{songTitleWithVerses}</Text>}
      {verses !== undefined ? undefined : <Text style={styles.text}>Failed to load verses</Text>}
      <View style={styles.verseList}>
        {verses
          ?.filter(hasVisibleNameForPicker)
          ?.map((it: VerseProps) => <VersePickerItem verse={it}
                                                     key={it.id}
                                                     isSelected={isVerseInList(selectedVerses, it)}
                                                     horizontalMargin={horizontalMargin}
                                                     onPress={toggleVerse}
                                                     onLongPress={onItemLongPress} />)}
      </View>
    </ScrollView>
  </View>;
};

export default VersePicker;

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.background
  },
  scrollView: {
    paddingHorizontal: 15,
    paddingVertical: 20
  },
  text: {
    color: colors.text.lighter,
    fontSize: 16,
    textAlign: "center",
    fontFamily: fontFamily.sansSerifLight,
    paddingHorizontal: 30
  },

  verseList: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "wrap",
    paddingTop: 10
  }
});
