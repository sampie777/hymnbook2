import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ParamList, SongRoute } from '../../../../../navigation';
import { EasterEggs } from "../../../../../logic/songs/easterEggs";
import { isSongValid } from "../../../../../logic/songs/utils";
import SongList from "../../../../../logic/songs/songList";
import { SearchResultItemBaseComponent } from "../SearchResultItemBaseComponent";
import { sanitizeErrorForRollbar } from "../../../../../logic/utils/utils.ts";
import { rollbar } from "../../../../../logic/rollbar";

type Props = {
  navigation: BottomTabNavigationProp<ParamList>
  selectedBundleUuids: string[]
};

const ImFeelingLucky: React.FC<Props> = ({
                                           navigation,
                                           selectedBundleUuids
                                         }) => {
  const [songAddedToSongList, setSongAddedToSongList] = useState(false);
  const clearCheckmarkTimeout = useRef<NodeJS.Timeout>(undefined);

  useFocusEffect(React.useCallback(() =>
    () => { // on blur
      if (clearCheckmarkTimeout.current !== undefined) {
        clearTimeout(clearCheckmarkTimeout.current);
      }
    }, []));


  const navigateToRandomSong = () => {
    const song = EasterEggs.findRandomSong(selectedBundleUuids)
    if (song == undefined) {
      return Alert.alert("Sorry", "There are no songs to choose from.")
    }

    if (!isSongValid(song)) {
      return Alert.alert("Just a moment", "This song has been updated. Please reload the search results.");
    }

    navigation.navigate(SongRoute, { id: song.id, uuid: song.uuid });
  };

  const addRandomSongToSongList = () => {
    const song = EasterEggs.findRandomSong(selectedBundleUuids)
    if (song == undefined) {
      return Alert.alert("Sorry", "There are no songs to choose from.")
    }

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
    clearCheckmarkTimeout.current = setTimeout(() => setSongAddedToSongList(false), 1000);
  };

  return <SearchResultItemBaseComponent
    songName={"I'm feeling lucky"}
    alternativeTitle={"Suggest me a random song"}
    onItemPress={navigateToRandomSong}
    onAddPress={addRandomSongToSongList}
    songAddedToSongList={songAddedToSongList}
  />
};

export default ImFeelingLucky;
