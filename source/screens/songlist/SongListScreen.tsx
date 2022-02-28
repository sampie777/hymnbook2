import React, { useEffect, useState } from "react";
import { BackHandler, FlatList, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/src/native-stack/types";
import Db from "../../scripts/db/db";
import { Verse } from "../../models/Songs";
import { routes, ParamList } from "../../navigation";
import { useFocusEffect } from "@react-navigation/native";
import SongList from "../../scripts/songs/songList";
import { SongListSongModel } from "../../models/SongListModel";
import { CollectionChangeCallback } from "realm";
import { SongListModelSchema } from "../../models/SongListModelSchema";
import { isTitleSimilarToOtherSongs } from "../../scripts/songs/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import DeleteModeButton from "./DeleteModeButton";
import SongItem from "./SongItem";

const SongListScreen: React.FC<NativeStackScreenProps<ParamList, "SongList">> =
  ({ navigation }) => {
    const [list, setList] = useState<Array<SongListSongModel>>([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const styles = createStyles(useTheme());

    useEffect(() => {
      onLaunch();
      return onExit;
    }, []);

    const onLaunch = () => {
      Db.songs.realm().objects(SongListModelSchema.name).addListener(onCollectionChange);
    };

    const onExit = () => Db.songs.realm().objects(SongListModelSchema.name).removeListener(onCollectionChange);

    React.useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (<DeleteModeButton onPress={toggleDeleteMode}
                                              onLongPress={clearAll}
                                              isActivated={isDeleteMode} />)
      });
    }, [navigation, isDeleteMode]);

    useFocusEffect(
      React.useCallback(() => {
        BackHandler.addEventListener("hardwareBackPress", onBackPress);
        reloadSongList();
        return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      }, [isDeleteMode])
    );

    useFocusEffect(
      React.useCallback(() => {
        onFocus();
        return onBlur;
      }, [])
    );

    const onFocus = () => {
    };

    const onBlur = () => {
      setIsDeleteMode(false);
    };

    const reloadSongList = () => {
      setList(SongList.list());
    };

    const onBackPress = (): boolean => {
      if (isDeleteMode) {
        setIsDeleteMode(false);
        return true;
      }
      return false;
    };

    const onCollectionChange: CollectionChangeCallback<Object> = () => {
      reloadSongList();
    };

    const onSearchResultItemPress = (index: number, songListSong: SongListSongModel) => {
      if (isDeleteMode) {
        return SongList.deleteSongAtIndex(index);
      }
      navigation.navigate(routes.Song, {
        id: songListSong.song.id,
        songListIndex: index,
        selectedVerses: songListSong.selectedVerses.map(it => Verse.toObject(it.verse))
      });
    };

    const renderSongListItem = ({ item }: { item: SongListSongModel }) => (
      <SongItem index={item.index}
                songListSong={item}
                onPress={onSearchResultItemPress}
                showDeleteButton={isDeleteMode}
                showSongBundle={isTitleSimilarToOtherSongs(item.song, list.map(it => it.song))} />
    );

    const toggleDeleteMode = () => setIsDeleteMode(it => !it);

    const clearAll = () => {
      SongList.clearAll();
      setIsDeleteMode(false);
    };

    return (
      <View style={styles.container}>
        <FlatList
          data={list}
          renderItem={renderSongListItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.songList} />
      </View>
    );
  };

export default SongListScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "stretch",
    backgroundColor: colors.background
  },

  songList: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 10,
    paddingTop: 10
  },
});
