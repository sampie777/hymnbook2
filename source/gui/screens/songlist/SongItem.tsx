import React from "react";
import { Song } from "../../../logic/db/models/Songs";
import { SongListSongModel } from "../../../logic/db/models/SongListModel";
import { generateSongTitle } from "../../../logic/songs/utils";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  index: number,
  songListSong: SongListSongModel,
  onPress: (index: number, songListSong: SongListSongModel) => void,
  onLongPress?: (index: number, songListSong: SongListSongModel) => void,
  onDeleteButtonPress: (index: number) => void,
  showDeleteButton: boolean,
  showSongBundle?: boolean,
}

const SongItem: React.FC<Props> = ({
                                     index,
                                     songListSong,
                                     onPress,
                                     onDeleteButtonPress,
                                     showDeleteButton,
                                     showSongBundle,
                                     onLongPress
                                   }) => {
  const styles = createStyles(useTheme());
  return <TouchableOpacity onPress={() => onPress(index, songListSong)}
                           onLongPress={onLongPress ? () => onLongPress(index, songListSong) : undefined}
                           style={styles.container}>
    <View style={styles.infoContainer}>
      <Text style={[styles.itemName, (showSongBundle ? {} : styles.itemExtraPadding)]}>
        {generateSongTitle(songListSong.song, songListSong.selectedVerses.map(it => it.verse))}
      </Text>

      {!showSongBundle ? undefined :
        <Text style={styles.songBundleName}>
          {Song.getSongBundle(songListSong.song)?.name}
        </Text>
      }
    </View>

    {!showDeleteButton ? undefined :
      <TouchableOpacity style={styles.button}
                        onPress={() => onDeleteButtonPress(index)}>
        <Icon name={"times"}
              size={styles.button.fontSize}
              color={styles.button.color} />
      </TouchableOpacity>
    }
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
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
    paddingVertical: 8
  },

  songBundleName: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.textLighter,
    fontStyle: "italic"
  },

  itemName: {
    paddingTop: 2,
    paddingHorizontal: 15,
    fontSize: 20,
    color: colors.text
  },
  itemExtraPadding: {
    paddingTop: 5,
    paddingBottom: 7
  },

  button: {
    padding: 15,
    right: 7,
    fontSize: 21,
    color: "#f17c7c"
  }
});

export default SongItem;
