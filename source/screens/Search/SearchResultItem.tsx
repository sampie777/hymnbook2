import React, { useRef, useState } from "react";
import { Song } from "../../models/Songs";
import { useFocusEffect } from "@react-navigation/native";
import SongList from "../../scripts/songs/songList";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

export const SearchResultItem: React.FC<{
  song: Song,
  onPress: (song: Song) => void,
  onAddedToSongList?: () => void,
  showSongBundle?: boolean,
}> =
  ({ song, onPress, onAddedToSongList, showSongBundle }) => {
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

      SongList.addSong(song);

      setSongAddedToSongList(true);
      clearCheckmarkTimeout.current = setTimeout(() => setSongAddedToSongList(false), 3000);

      if (onAddedToSongList !== undefined) {
        runOnAddedCallbackTimeout.current = setTimeout(onAddedToSongList, 300);
      }
    };

    return (<TouchableOpacity onPress={() => onPress(song)} style={styles.searchListItem}>
      <View style={styles.infoContainer}>
        <Text style={[styles.itemName, (showSongBundle ? {} : styles.itemExtraPadding)]}>{song.name}</Text>

        {!showSongBundle ? undefined :
          <Text style={styles.songBundleName}>
            {Song.getSongBundle(song)?.name}
          </Text>
        }
      </View>

      <TouchableOpacity onPress={addSongToSongList}
                        style={styles.button}>
        <Icon name={songAddedToSongList ? "check" : "plus"}
              size={styles.button.fontSize}
              color={songAddedToSongList
                ? styles.buttonHighlight.color
                : styles.button.color} />
      </TouchableOpacity>
    </TouchableOpacity>);
  };

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  searchListItem: {
    marginBottom: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },

  infoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 8,
  },

  songBundleName: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.textLighter,
    fontFamily: "sans-serif-light",
    fontStyle: "italic"
  },

  itemName: {
    paddingTop: 2,
    paddingHorizontal: 15,
    fontSize: 24,
    color: colors.text
  },
  itemExtraPadding: {
    paddingTop: 5,
    paddingBottom: 7
  },

  button: {
    padding: 15,
    fontSize: 24,
    color: "#9fec9f"
  },
  buttonHighlight: {
    color: "#2fd32f"
  }
});
