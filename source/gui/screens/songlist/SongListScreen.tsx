import React, { useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Db from "../../../logic/db/db";
import { Verse } from "../../../logic/db/models/songs/Songs";
import { ParamList, SongListRoute, SongRoute } from "../../../navigation";
import { useFocusEffect } from "@react-navigation/native";
import SongList from "../../../logic/songs/songList";
import { SongListSongModel } from "../../../logic/db/models/songs/SongListModel";
import { SongListModelSchema } from "../../../logic/db/models/songs/SongListModelSchema";
import { isTitleSimilarToOtherSongs } from "../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import SongItem from "./SongItem";
import ScreenHeader from "./ScreenHeader";
import DeleteAllButton from "./DeleteAllButton";
import { rollbar } from "../../../logic/rollbar";
import { sanitizeErrorForRollbar } from "../../../logic/utils";
import SongListInstructions from "./SongListInstructions";
import { SongHistoryController } from "../../../logic/songs/history/songHistoryController";
import { useCollectionListener } from "../../components/utils";
import { SongHistorySchema } from "../../../logic/db/models/songs/SongHistorySchema";
import DraggableFlatList, { DragEndParams, RenderItemParams } from "react-native-draggable-flatlist";

const SongListScreen: React.FC<NativeStackScreenProps<ParamList, typeof SongListRoute>> =
  ({ navigation }) => {
    const [list, setList] = useState<SongListSongModel[]>([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [listHasBeenChanged, setListHasBeenChanged] = useState(false);
    const [lastSeenSongListSongIndex, setLastSeenSongListSongIndex] = useState<number | undefined>();
    const styles = createStyles(useTheme());

    const getLastSeenSongIndexFromHistory = () => {
      const lastSongListItem = SongHistoryController.getLastSongListItem();
      if (lastSongListItem == undefined) {
        return setLastSeenSongListSongIndex(undefined);
      }

      const item = list.find(it => it.id == lastSongListItem.songListItemId);

      // Check if item still exists or is in the active list
      if (item == undefined || !(item.song.uuid == lastSongListItem.songUuid || item.song.id == lastSongListItem.id)) {
        return setLastSeenSongListSongIndex(undefined);
      }

      setLastSeenSongListSongIndex(item.index);
    };

    useEffect(() => {
      onLaunch();
      return onExit;
    }, []);

    const onLaunch = () => {
      try {
        Db.songs.realm().objects(SongListModelSchema.name).addListener(onCollectionChange);
      } catch (error) {
        rollbar.error("Failed to handle collection change", sanitizeErrorForRollbar(error));
      }
    };

    const onExit = () => Db.songs.realm().objects(SongListModelSchema.name).removeListener(onCollectionChange);

    useCollectionListener(Db.songs.realm().objects(SongHistorySchema.name), getLastSeenSongIndexFromHistory, [list]);

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

      getLastSeenSongIndexFromHistory();
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
      setList(SongList.list().map(it => SongListSongModel.clone(it)))
    };

    const onBackPress = (): boolean => {
      if (isDeleteMode) {
        setIsDeleteMode(false);
        return true;
      }
      return false;
    };

    const onCollectionChange = () => {
      reloadSongList();
    };

    const onItemPress = (index: number, songListSong: SongListSongModel) => {
      navigation.navigate(SongRoute, {
        id: songListSong.song.id,
        uuid: songListSong.song.uuid,
        songListIndex: index,
        selectedVerses: songListSong.selectedVerses.map(it => Verse.toObject(it.verse))
      });
    };

    const onItemLongPress = (index: number, songListSong: SongListSongModel) => {
      setIsDeleteMode(true);
    };

    const onItemDeleteButtonPress = (index: number) => {
      // Check list length, because if the list is emptied using deleteAll, the GUI crashes when we also try to set
      // setListHasBeenChanged to true. This doesn't appear to be happening here, but better safe than sorry.
      if (list.length > 1) setListHasBeenChanged(true);

      SongList.deleteSongAtIndex(index);
    };

    const renderSongListItem = ({ item, drag, isActive }: RenderItemParams<SongListSongModel>) => {
      return <SongItem index={item.index}
                       songListSong={item}
                       onPress={onItemPress}
                       onLongPress={drag}
                       onDeleteButtonPress={onItemDeleteButtonPress}
                       showDeleteButton={isDeleteMode}
                       showSongBundle={isTitleSimilarToOtherSongs(item.song, list.map(it => it.song))}
                       markAsSeen={item.index <= (lastSeenSongListSongIndex ?? -1)}
                       isDragging={isActive} />
    }

    const toggleDeleteMode = () => setIsDeleteMode(it => !it);

    const clearAll = () => {
      SongList.clearAll();
    };

    const onDragEnd = (data: DragEndParams<SongListSongModel>) => {
      SongList.moveSong(data.from, data.to > data.from ? data.to + 1 : data.to)
    };

    return <View style={styles.container}>
      <DraggableFlatList
        data={list}
        style={{ height: "100%" }}
        renderItem={renderSongListItem}
        keyExtractor={item => item.id.toString()}
        onDragEnd={onDragEnd}
        contentContainerStyle={styles.songList}
        ListFooterComponent={isDeleteMode && list.length > 0 ? <DeleteAllButton onPress={clearAll} /> : undefined}
        ListEmptyComponent={<SongListInstructions navigation={navigation} />}
        importantForAccessibility={list.length > 0 ? undefined : "no"} />
    </View>
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
    paddingTop: 6,
  }
});
