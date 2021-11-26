import React, { useEffect, useState } from "react";
import { BackHandler, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Db from "../scripts/db/db";
import { Verse } from "../models/Songs";
import { SongRouteParams, routes } from "../navigation";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";
import SongList from "../scripts/songs/songList";
import { SongListSongModel } from "../models/SongListModel";
import { CollectionChangeCallback } from "realm";
import { SongListModelSchema } from "../models/SongListModelSchema";
import { generateSongTitle } from "../scripts/songs/utils";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ThemeContextProps, useTheme } from "../components/ThemeProvider";

const DeleteModeButton: React.FC<{
  onPress: () => void,
  onLongPress: () => void,
  isActivated: boolean
}> = ({
        onPress,
        onLongPress,
        isActivated = false
      }) => {
  const styles = createStyles(useTheme());
  return <TouchableOpacity onPress={onPress}
                           onLongPress={onLongPress}
                           style={styles.deleteModeButton}>
    <Icon name={"trash-alt"}
          solid={isActivated}
          size={styles.deleteModeButton.fontSize}
          color={!isActivated ? styles.deleteModeButton.color : styles.deleteModeButtonActive.color} />
  </TouchableOpacity>;
};

const SongItem: React.FC<{
  index: number,
  songListSong: SongListSongModel,
  onPress: (index: number, songListSong: SongListSongModel) => void,
  showDeleteButton: boolean,
}> =
  ({ index, songListSong, onPress, showDeleteButton }) => {
    const styles = createStyles(useTheme());
    return <TouchableOpacity onPress={() => onPress(index, songListSong)} style={styles.songListItem}>
      <Text style={styles.songListItemText}>
        {generateSongTitle(songListSong.song, songListSong.selectedVerses.map(it => it.verse))}
      </Text>

      {!showDeleteButton ? undefined :
        <View style={styles.songListItemButton}>
          <Icon name={"times"}
                size={styles.songListItemButton.fontSize}
                color={styles.songListItemButton.color} />
        </View>
      }
    </TouchableOpacity>;
  };

const SongListScreen: React.FC<{ navigation: BottomTabNavigationProp<any> }> =
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
      } as SongRouteParams);
    };

    const renderSongListItem = ({ item }: { item: SongListSongModel }) => (
      <SongItem index={item.index}
                songListSong={item}
                onPress={onSearchResultItemPress}
                showDeleteButton={isDeleteMode} />
    );

    const toggleDeleteMode = () => setIsDeleteMode(it => !it);

    const clearAll = () => {
      if (!isDeleteMode)
        return;

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
    backgroundColor: colors.background,
  },

  songList: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 10,
    paddingTop: 10
  },
  songListItem: {
    marginBottom: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  songListItemText: {
    padding: 15,
    fontSize: 24,
    flex: 1,
    color: colors.text,
  },
  songListItemButton: {
    padding: 15,
    right: 7,
    fontSize: 21,
    color: "#f17c7c"
  },

  deleteModeButton: {
    padding: 15,
    right: 5,
    fontSize: 21,
    color: "#ffb8b8"
  },
  deleteModeButtonActive: {
    color: "#f17c7c"
  }
});
