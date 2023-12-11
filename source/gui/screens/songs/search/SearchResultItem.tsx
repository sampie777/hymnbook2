import React, { useRef, useState } from "react";
import { rollbar } from "../../../../logic/rollbar";
import { sanitizeErrorForRollbar } from "../../../../logic/utils";
import { ParamList, SongRoute, VersePickerMethod, VersePickerRoute } from "../../../../navigation";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import { useFocusEffect } from "@react-navigation/native";
import SongList from "../../../../logic/songs/songList";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { RectangularInset } from "../../../components/utils";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import OffscreenTouchableOpacity from "../../../components/OffscreenTouchableOpacity";

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
    const styles = createStyles(useTheme());

    useFocusEffect(React.useCallback(() =>
      () => { // on blur
        if (clearCheckmarkTimeout.current !== undefined) {
          clearTimeout(clearCheckmarkTimeout.current);
        }
        if (runOnAddedCallbackTimeout.current !== undefined) {
          clearTimeout(runOnAddedCallbackTimeout.current);
        }
      }, []));

    const addSongToSongList = () => {
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
      beforeNavigating?.();
      navigation.navigate(SongRoute, { id: song.id });
    };

    const navigateToVersePicker = () => {
      beforeNavigating?.();
      navigation.navigate(VersePickerRoute, {
        verses: song.verses?.map(it => Verse.toObject(it)),
        selectedVerses: [],
        songId: song.id,
        songName: song.name,
        method: VersePickerMethod.ShowSong
      });
    };

    const navigateToVersePickerForSongList = () => {
      beforeNavigating?.();
      navigation.navigate(VersePickerRoute, {
        verses: song.verses?.map(it => Verse.toObject(it)),
        selectedVerses: [],
        songId: song.id,
        songName: song.name,
        method: VersePickerMethod.AddToSongListAndShowSearch
      });
    };

    return <OffscreenTouchableOpacity onPress={navigateToSong}
                                      onLongPress={navigateToVersePicker}
                                      style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={[styles.itemName, (showSongBundle ? {} : styles.itemExtraPadding)]}>{song.name}</Text>

        {!showSongBundle ? undefined :
          <Text style={styles.songBundleName}>
            {Song.getSongBundle(song)?.name}
          </Text>
        }
      </View>

      <TouchableOpacity onPress={addSongToSongList}
                        onLongPress={navigateToVersePickerForSongList}
                        style={styles.button}
                        hitSlop={RectangularInset(styles.infoContainer.paddingVertical)}>
        <Icon name={songAddedToSongList ? "check" : "plus"}
              size={styles.button.fontSize}
              color={songAddedToSongList
                ? styles.buttonHighlight.color as string
                : styles.button.color as string} />
      </TouchableOpacity>
    </OffscreenTouchableOpacity>;
  };

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    marginBottom: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border.default,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },

  infoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 8
  },

  songBundleName: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.text.lighter,
    fontStyle: "italic"
  },

  itemName: {
    paddingTop: 2,
    paddingHorizontal: 15,
    fontSize: 24,
    color: colors.text.default
  },
  itemExtraPadding: {
    paddingTop: 5,
    paddingBottom: 7
  },

  button: {
    marginRight: 8,
    height: 45,
    width: 45,
    fontSize: 22,
    color: colors.primary.light,
    backgroundColor: colors.surface2,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3
  },
  buttonHighlight: {
    color: colors.primary.default
  }
});
