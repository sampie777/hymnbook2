import React, { useEffect, useState } from "react";
import { BackHandler, FlatList, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Db from "../../../logic/db/db";
import { Verse } from "../../../logic/db/models/Songs";
import { ParamList, SongListRoute, SongRoute } from "../../../navigation";
import { useFocusEffect } from "@react-navigation/native";
import SongList from "../../../logic/songs/songList";
import { SongListSongModel } from "../../../logic/db/models/SongListModel";
import { CollectionChangeCallback } from "realm";
import { SongListModelSchema } from "../../../logic/db/models/SongListModelSchema";
import { isTitleSimilarToOtherSongs } from "../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import SongItem from "./SongItem";
import ScreenHeader from "./ScreenHeader";
import DeleteAllButton from "./DeleteAllButton";

const SongListScreen: React.FC<NativeStackScreenProps<ParamList, typeof SongListRoute>> =
  ({ navigation }) => {
    const [list, setList] = useState<Array<SongListSongModel>>([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [listHasBeenChanged, setListHasBeenChanged] = useState(false);
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
        headerRight: () => <ScreenHeader toggleDeleteMode={toggleDeleteMode}
                                         isDeleteMode={isDeleteMode}
                                         listHasBeenChanged={listHasBeenChanged} />
      });
    }, [navigation, isDeleteMode, listHasBeenChanged]);

    useFocusEffect(
      React.useCallback(() => {
        BackHandler.addEventListener("hardwareBackPress", onBackPress);

        reloadSongList();

        setListHasBeenChanged(false);

        return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      }, [isDeleteMode])
    );

    useEffect(() => {
      if (isDeleteMode && list.length === 0) {
        setIsDeleteMode(false);
      }
    }, [list]);

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
      navigation.navigate(SongRoute, {
        id: songListSong.song.id,
        songListIndex: index,
        selectedVerses: songListSong.selectedVerses.map(it => Verse.toObject(it.verse))
      });
    };

    const onSearchResultItemLongPress = (index: number, songListSong: SongListSongModel) => {
      setIsDeleteMode(true);
    };

    const onSearchResultItemDeleteButtonPress = (index: number) => {
      // Check list length, because if the list is emptied using deleteAll, the GUI crashes when we also try to set
      // setListHasBeenChanged to true. This doesn't appear to be happening here, but better safe than sorry.
      if (list.length > 1) setListHasBeenChanged(true)

      SongList.deleteSongAtIndex(index);
    };

    const renderSongListItem = ({ item }: { item: SongListSongModel }) => (
      <SongItem index={item.index}
                songListSong={item}
                onPress={onSearchResultItemPress}
                onLongPress={onSearchResultItemLongPress}
                onDeleteButtonPress={onSearchResultItemDeleteButtonPress}
                showDeleteButton={isDeleteMode}
                showSongBundle={isTitleSimilarToOtherSongs(item.song, list.map(it => it.song))} />
    );

    const toggleDeleteMode = () => setIsDeleteMode(it => !it);

    const clearAll = () => {
      SongList.clearAll();
    };

    return (
      <View style={styles.container}>
        <FlatList
          data={list}
          renderItem={renderSongListItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.songList}
          ListFooterComponent={isDeleteMode && list.length > 0 ? <DeleteAllButton onPress={clearAll} /> : undefined} />
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
    paddingTop: 6
  }
});
