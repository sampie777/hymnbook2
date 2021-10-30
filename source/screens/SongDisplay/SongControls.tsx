import React from "react";
import { SongListSongModel } from "../../models/SongListModel";
import SongList from "../../scripts/songs/songList";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { routes } from "../../navigation";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import Settings from "../../scripts/settings";
import { Song } from "../../models/Songs";

interface SongControlsProps {
  navigation: DrawerNavigationProp<any>;
  songListIndex?: number;
  song?: Song;
  listViewIndex: number;
  flatListComponentRef?: FlatList;
  invertVerseButton?: boolean;
}

const SongControls: React.FC<SongControlsProps> =
  ({
     navigation,
     songListIndex,
     song,
     listViewIndex,
     flatListComponentRef,
     invertVerseButton = true
   }) => {
    const previousSong = songListIndex === undefined ? undefined : SongList.previousSong(songListIndex);
    const nextSong = songListIndex === undefined ? undefined : SongList.nextSong(songListIndex);

    const goToSongListSong = (songListSong: SongListSongModel) => {
      navigation.navigate(routes.Song, {
        id: songListSong.song.id,
        songListIndex: songListSong.index
      });
    };

    const canJumpToNextVerse = () => song !== undefined && listViewIndex + 1 < song?.verses.length;

    const jumpToNextVerse = () => {
      if (!canJumpToNextVerse()) {
        return;
      }

      flatListComponentRef?.scrollToIndex({
        index: listViewIndex + 1,
        animated: Settings.animateScrolling
      });
    };

    const jumpToLastVerse = () => {
      if (!canJumpToNextVerse()) {
        return;
      }

      flatListComponentRef?.scrollToIndex({
        index: song!.verses.length - 1,
        animated: Settings.animateScrolling
      });
    };

    return (<View style={styles.container}>

      {previousSong === undefined ? undefined :
        <TouchableOpacity style={[styles.buttonBase, styles.button]}
                          onPress={() => goToSongListSong(previousSong)}>
          <Icon name={"chevron-left"}
                color={styles.buttonText.color}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </TouchableOpacity>
      }

      <View style={styles.horizontalGap} />

      {!Settings.showJumpToNextVerseButton ? undefined :
        <TouchableOpacity style={[
          styles.buttonBase,
          styles.button,
          (!invertVerseButton ? {} : styles.buttonInvert),
          (canJumpToNextVerse() ? {} : styles.buttonDisabled)
        ]}
                          activeOpacity={canJumpToNextVerse() ? 0.7 : 1}
                          onPress={jumpToNextVerse}
                          onLongPress={jumpToLastVerse}>
          <Icon name={"chevron-down"}
                style={[
                  styles.buttonText,
                  (!invertVerseButton ? {} : styles.buttonInvertText),
                  (canJumpToNextVerse() ? {} : styles.buttonTextDisabled)
                ]} />
        </TouchableOpacity>
      }

      {nextSong === undefined ?
        (songListIndex === undefined ? undefined : <View style={styles.buttonBase} />) :
        <TouchableOpacity style={[styles.buttonBase, styles.button]}
                          onPress={() => goToSongListSong(nextSong)}>
          <Icon name={"chevron-right"}
                color={styles.buttonText.color}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </TouchableOpacity>
      }
    </View>);
  };

export default SongControls;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    width: "100%",
    bottom: 30,
    paddingHorizontal: 20
  },

  buttonBase: {
    width: 45,
    height: 45,
    marginHorizontal: 10
  },
  button: {
    backgroundColor: "dodgerblue",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",

    zIndex: 10,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  buttonDisabled: {
    backgroundColor: "#f8f8f8",
    elevation: 2
  },
  buttonInvert: {
    backgroundColor: "#fcfcfc"
  },

  buttonText: {
    color: "white",
    fontSize: 18
  },
  buttonTextDisabled: {
    color: "#ccc"
  },
  buttonInvertText: {
    color: "#999"
  },

  horizontalGap: {
    flex: 1
  }
});
