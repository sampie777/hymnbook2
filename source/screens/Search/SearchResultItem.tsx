import React, { useRef, useState } from "react";
import { Song } from "../../models/Songs";
import { useFocusEffect } from "@react-navigation/native";
import SongList from "../../scripts/songs/songList";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

export const SearchResultItem: React.FC<{
  song: Song,
  onPress: (song: Song) => void,
  onAddedToSongList?: () => void,
}> =
  ({ song, onPress, onAddedToSongList }) => {
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
      <Text style={styles.searchListItemText}>{song.name}</Text>

      <TouchableOpacity onPress={addSongToSongList}
                        style={styles.searchListItemButton}>
        <Icon name={songAddedToSongList ? "check" : "plus"}
              size={styles.searchListItemButton.fontSize}
              color={songAddedToSongList
                ? styles.searchListItemButtonHighlight.color
                : styles.searchListItemButton.color} />
      </TouchableOpacity>
    </TouchableOpacity>);
  };

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  searchListItem: {
    marginBottom: 1,
    backgroundColor: colors.height1,
    borderColor: colors.border0,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  searchListItemText: {
    padding: 15,
    fontSize: 24,
    flex: 1,
    color: colors.text0,
  },
  searchListItemButton: {
    padding: 15,
    fontSize: 24,
    color: "#9fec9f"
  },
  searchListItemButtonHighlight: {
    color: "#2fd32f"
  }
});
