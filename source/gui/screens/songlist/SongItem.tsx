import React, { useState } from "react";
import { Song, SongMetadataType } from "../../../logic/db/models/songs/Songs";
import { SongListSongModel } from "../../../logic/db/models/songs/SongListModel";
import { generateSongTitle, isSongValid } from "../../../logic/songs/utils";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";
import { runAsync } from "../../../logic/utils/utils.ts";
import LoadingIndicator from "../../components/LoadingIndicator";
import SongExtraInfo from "../../components/SongExtraInfo";

interface Props {
  index: number,
  songListSong: SongListSongModel,
  onPress: (index: number, songListSong: SongListSongModel) => void,
  onLongPress?: (index: number, songListSong: SongListSongModel) => void,
  onDeleteButtonPress: (index: number) => void,
  showDeleteButton: boolean,
  showSongBundle?: boolean,
  markAsSeen?: boolean,
  isDragging?: boolean,
}

const SongItem: React.FC<Props> = ({
                                     index,
                                     songListSong,
                                     onPress,
                                     onDeleteButtonPress,
                                     showDeleteButton,
                                     showSongBundle,
                                     onLongPress,
                                     markAsSeen,
                                     isDragging,
                                   }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const styles = createStyles(useTheme());
  if (!isSongValid(songListSong.song)) return null;

  const onDelete = () => {
    if (isDeleting) return;

    setIsDeleting(true);
    runAsync(() => {
      onDeleteButtonPress(index);
      setIsDeleting(false);
    })
  }

  const alternativeTitle = songListSong.song.metadata
    .find(it => it.type === SongMetadataType.AlternativeTitle)?.value;

  return <TouchableOpacity onPress={() => onPress(index, songListSong)}
                           onLongPress={onLongPress ? () => onLongPress(index, songListSong) : undefined}
                           style={[styles.container, (isDragging ? styles.dragging : {})]}>
    <View style={styles.infoContainer}>
      <Text
        style={[
          styles.itemName,
          (showSongBundle || alternativeTitle ? {} : styles.itemExtraPadding),
          (!showDeleteButton && markAsSeen ? styles.itemNameSeen : {})
        ]}
        importantForAccessibility={"auto"}>
        {generateSongTitle(songListSong.song, songListSong.selectedVerses.map(it => it.verse))}
      </Text>

      <SongExtraInfo alternativeTitle={alternativeTitle}
                     songBundle={showSongBundle ? Song.getSongBundle(songListSong.song)?.name : undefined}
                     width={"100%"} />
    </View>

    {!showDeleteButton ? undefined :
      <TouchableOpacity style={styles.button}
                        disabled={isDeleting}
                        onPress={onDelete}
                        accessibilityLabel={`Delete ${songListSong.song.name}`}>
        {isDeleting
          ? <LoadingIndicator size={20} />
          : <Icon name={"trash-alt"}
                  size={styles.button.fontSize}
                  color={styles.button.color} />
        }
      </TouchableOpacity>
    }
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    marginBottom: 1,
    backgroundColor: colors.surface1,
    borderBottomColor: colors.border.default,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  dragging: {
    opacity: 1,
    borderRadius: 5,
    marginLeft: 7,
    marginRight: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },

  infoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 8
  },

  itemName: {
    paddingTop: 2,
    paddingHorizontal: 15,
    fontSize: 20,
    color: colors.text.default,
  },
  itemExtraPadding: {
    paddingTop: 5,
    paddingBottom: 7
  },
  itemNameSeen: {
    fontStyle: "italic",
  },

  button: {
    padding: 15,
    paddingRight: 22,
    fontSize: 18,
    color: colors.text.error
  }
});

export default SongItem;
