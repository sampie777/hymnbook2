import React from "react";
import { NativeStackNavigationProp } from "react-native-screens/src/native-stack/types";
import { SongListSongModel } from "../../../logic/db/models/SongListModel";
import SongList from "../../../logic/songs/songList";
import { routes, ParamList } from "../../../navigation";
import Settings from "../../../settings";
import { Song, Verse } from "../../../logic/db/models/Songs";
import { getNextVerseIndex } from "../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome5";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ComponentProps {
  navigation: NativeStackNavigationProp<ParamList>
  songListIndex?: number;
  song?: Song;
  listViewIndex: number;
  flatListComponentRef?: FlatList<any>;
  selectedVerses?: Array<Verse>;
}

const SongControls: React.FC<ComponentProps> =
  ({
     navigation,
     songListIndex,
     song,
     listViewIndex,
     flatListComponentRef,
     selectedVerses = []
   }) => {
    const previousSong = songListIndex === undefined ? undefined : SongList.previousSong(songListIndex);
    const nextSong = songListIndex === undefined ? undefined : SongList.nextSong(songListIndex);
    const hasSelectableVerses = selectedVerses !== undefined && selectedVerses.length > 0;
    const styles = createStyles(useTheme());

    const goToSongListSong = (songListSong: SongListSongModel) => {
      navigation.navigate(routes.Song, {
        id: songListSong.song.id,
        songListIndex: songListSong.index,
        selectedVerses: songListSong.selectedVerses.map(it => Verse.toObject(it.verse))
      });
    };

    const canJumpToNextVerse = () => {
      if (!hasSelectableVerses) {
        return song !== undefined && listViewIndex + 1 < song?.verses.length;
      }
      return getNextVerseIndex(selectedVerses, listViewIndex) > -1;
    };

    const jumpToNextVerse = () => {
      if (!canJumpToNextVerse()) {
        return;
      }

      let nextIndex = listViewIndex + 1;
      if (hasSelectableVerses) {
        nextIndex = getNextVerseIndex(selectedVerses, listViewIndex);
      }

      flatListComponentRef?.scrollToIndex({
        index: nextIndex,
        animated: Settings.animateScrolling
      });
    };

    const jumpToLastVerse = () => {
      if (!canJumpToNextVerse()) {
        return;
      }

      let lastIndex = song!.verses.length - 1;
      if (hasSelectableVerses) {
        lastIndex = selectedVerses[selectedVerses.length - 1].index;
      }

      flatListComponentRef?.scrollToIndex({
        index: lastIndex,
        animated: Settings.animateScrolling
      });
    };

    return (<View style={styles.container} pointerEvents={'box-none'} >

      {previousSong === undefined ? undefined :
        <TouchableOpacity style={[styles.buttonBase, styles.button]}
                          onPress={() => goToSongListSong(previousSong)}>
          <Icon name={"chevron-left"}
                color={styles.buttonText.color as string}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </TouchableOpacity>
      }

      <View style={styles.horizontalGap} />

      {!Settings.showJumpToNextVerseButton ? undefined :
        <TouchableOpacity style={[
          styles.buttonBase,
          styles.button,
          (hasSelectableVerses ? {} : styles.buttonInvert),
          (canJumpToNextVerse() ? {} : styles.buttonDisabled)
        ]}
                          activeOpacity={canJumpToNextVerse() ? 0.7 : 1}
                          onPress={jumpToNextVerse}
                          onLongPress={jumpToLastVerse}>
          <Icon name={"chevron-down"}
                style={[
                  styles.buttonText,
                  (hasSelectableVerses ? {} : styles.buttonInvertText),
                  (canJumpToNextVerse() ? {} : styles.buttonTextDisabled)
                ]} />
        </TouchableOpacity>
      }

      {nextSong === undefined ?
        (songListIndex === undefined ? undefined : <View style={styles.buttonBase} />) :
        <TouchableOpacity style={[styles.buttonBase, styles.button]}
                          onPress={() => goToSongListSong(nextSong)}>
          <Icon name={"chevron-right"}
                color={styles.buttonText.color as string}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </TouchableOpacity>
      }
    </View>);
  };

export default SongControls;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    width: "100%",
    bottom: 30,
    paddingHorizontal: 3,
    zIndex: 1,
  },

  buttonBase: {
    width: 45,
    height: 45,
    marginHorizontal: 10
  },
  button: {
    backgroundColor: colors.primaryVariant,
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
    backgroundColor: colors.buttonVariant,
    elevation: 2
  },
  buttonInvert: {
    backgroundColor: colors.button,
  },

  buttonText: {
    color: colors.onPrimary,
    fontSize: 18
  },
  buttonTextDisabled: {
    opacity: 0.3,
    color: colors.textLighter
  },
  buttonInvertText: {
    color: colors.textLighter
  },

  horizontalGap: {
    flex: 1
  }
});
