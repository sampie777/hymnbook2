import React, { useRef, useState } from "react";
import { Song } from "../../models/Songs";
import { useFocusEffect } from "@react-navigation/native";
import SongList from "../../scripts/songs/songList";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

export const SearchResultItem: React.FC<{ song: Song, onPress: (song: Song) => void }> =
  ({ song, onPress }) => {
    const [songAddedToSongList, setSongAddedToSongList] = useState(false);
    const timeout = useRef<NodeJS.Timeout>();

    useFocusEffect(React.useCallback(() =>
      () => { // on blur
        if (timeout.current !== undefined) {
          clearTimeout(timeout.current);
        }
      }, []));

    const addSongToSongList = () => {
      if (songAddedToSongList) {
        return; // Wait for cool down
      }
      SongList.addSong(song);
      setSongAddedToSongList(true);
      timeout.current = setTimeout(() => setSongAddedToSongList(false), 3000);
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

const styles = StyleSheet.create({
  searchListItem: {
    marginBottom: 1,
    backgroundColor: "#fcfcfc",
    borderColor: "#ddd",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  searchListItemText: {
    padding: 15,
    fontSize: 24,
    flex: 1
  },
  searchListItemButton: {
    padding: 15,
    fontSize: 24,
    color: "#9fec9f"
  },
  searchListItemButtonHighlight: {
    color: "#2fd32f"
  },
});
