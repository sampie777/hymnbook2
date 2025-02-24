import React, { useRef, useState } from "react";
import { rollbar } from "../../../../logic/rollbar";
import { sanitizeErrorForRollbar } from "../../../../logic/utils";
import { ParamList, SongRoute, VersePickerMethod, VersePickerRoute } from "../../../../navigation";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import { useFocusEffect } from "@react-navigation/native";
import SongList from "../../../../logic/songs/songList";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { SearchResultItemBaseComponent } from "./SearchResultItemBaseComponent";
import { Alert } from "react-native";
import { isSongValid } from "../../../../logic/songs/utils";

export const SearchResultItem: React.FC<{
  navigation: BottomTabNavigationProp<ParamList>,
  song: Song,
  beforeNavigating?: () => void,
  onAddedToSongList?: () => void,
  showSongBundle?: boolean,
}> =
  ({
     navigation,
     song,
     beforeNavigating,
     onAddedToSongList,
     showSongBundle
   }) => {
    const [songAddedToSongList, setSongAddedToSongList] = useState(false);
    const clearCheckmarkTimeout = useRef<NodeJS.Timeout>();
    const runOnAddedCallbackTimeout = useRef<NodeJS.Timeout>();

    useFocusEffect(React.useCallback(() =>
      () => { // on blur
        if (clearCheckmarkTimeout.current !== undefined) {
          clearTimeout(clearCheckmarkTimeout.current);
        }
        if (runOnAddedCallbackTimeout.current !== undefined) {
          clearTimeout(runOnAddedCallbackTimeout.current);
        }
      }, []));

    if (!isSongValid(song)) return null;

    const addSongToSongList = () => {
      if (!isSongValid(song)) {
        return Alert.alert("Just a moment", "This song has been updated. Please reload the search results.");
      }

      if (songAddedToSongList) {
        return; // Wait for cool down
      }

      try {
        SongList.addSong(song);
      } catch (error) {
        rollbar.error(`Failed to add song to songlist`, {
          ...sanitizeErrorForRollbar(error),
          song: song,
          callFrom: "SearchResultItem"
        });
        Alert.alert("Could not add song to songlist: " + error);
        return;
      }

      setSongAddedToSongList(true);
      clearCheckmarkTimeout.current = setTimeout(() => setSongAddedToSongList(false), 3000);

      if (onAddedToSongList !== undefined) {
        runOnAddedCallbackTimeout.current = setTimeout(onAddedToSongList, 300);
      }
    };

    const navigateToSong = () => {
      if (!isSongValid(song)) {
        return Alert.alert("Just a moment", "This song has been updated. Please reload the search results.");
      }

      beforeNavigating?.();
      navigation.navigate(SongRoute, { id: song.id, uuid: song.uuid });
    };

    const navigateToVersePicker = () => {
      if (!isSongValid(song)) {
        return Alert.alert("Just a moment", "This song has been updated. Please reload the search results.");
      }

      beforeNavigating?.();
      navigation.navigate(VersePickerRoute, {
        verses: song.verses?.map(it => Verse.toObject(it)),
        selectedVerses: [],
        songId: song.id,
        songUuid: song.uuid,
        songName: song.name,
        method: VersePickerMethod.ShowSong
      });
    };

    const navigateToVersePickerForSongList = () => {
      if (!isSongValid(song)) {
        return Alert.alert("Just a moment", "This song has been updated. Please reload the search results.");
      }

      beforeNavigating?.();
      navigation.navigate(VersePickerRoute, {
        verses: song.verses?.map(it => Verse.toObject(it)),
        selectedVerses: [],
        songId: song.id,
        songUuid: song.uuid,
        songName: song.name,
        method: VersePickerMethod.AddToSongListAndShowSearch
      });
    };

    return <SearchResultItemBaseComponent
      songName={song.name}
      bundleName={showSongBundle ? Song.getSongBundle(song)?.name : undefined}
      songAddedToSongList={songAddedToSongList}
      onItemPress={navigateToSong}
      onItemLongPress={navigateToVersePicker}
      onAddPress={addSongToSongList}
      onAddLongPress={navigateToVersePickerForSongList}
    />
  };
