import React, { useEffect, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SongListSongModel } from "../../../../logic/db/models/SongListModel";
import SongList from "../../../../logic/songs/songList";
import { ParamList, SongRoute } from "../../../../navigation";
import Settings from "../../../../settings";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import { getNextVerseIndex } from "../../../../logic/songs/utils";
import { RectangularInset } from "../../../components/utils";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome5";

interface ComponentProps {
  navigation: NativeStackNavigationProp<ParamList>;
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
    const [jumpToVerseTargetIndex, setJumpToVerseTargetIndex] = useState<number | null>(null);
    const styles = createStyles(useTheme());

    useEffect(() => {
      if (listViewIndex == jumpToVerseTargetIndex) {
        setJumpToVerseTargetIndex(null);
      }
    }, [listViewIndex]);

    const goToSongListSong = (songListSong: SongListSongModel) => {
      requestAnimationFrame(() => navigation.navigate(SongRoute, {
        id: songListSong.song.id,
        songListIndex: songListSong.index,
        selectedVerses: songListSong.selectedVerses.map(it => Verse.toObject(it.verse))
      }));
    };

    const canJumpToNextVerse = (): boolean => {
      if (song == null) return false;

      const nextIndex = jumpToVerseTargetIndex ?? listViewIndex;

      if (!hasSelectableVerses) {
        return nextIndex + 1 < song?.verses.length;
      }
      return getNextVerseIndex(selectedVerses, nextIndex) > -1;
    };

    const jumpToNextVerse = () => {
      if (!canJumpToNextVerse()) {
        return;
      }

      let nextIndex = (jumpToVerseTargetIndex ?? listViewIndex) + 1;
      if (hasSelectableVerses) {
        nextIndex = getNextVerseIndex(selectedVerses, jumpToVerseTargetIndex ?? listViewIndex);
      }

      nextIndex = Math.min((song?.verses.length ?? 1) - 1, nextIndex);

      setJumpToVerseTargetIndex(nextIndex);
      flatListComponentRef?.scrollToIndex({
        index: nextIndex,
        animated: Settings.animateScrolling
      });
    };

    const jumpToLastVerse = () => {
      if (!canJumpToNextVerse()) {
        return;
      }

      let lastIndex = (song?.verses.length ?? 1) - 1;
      if (hasSelectableVerses) {
        lastIndex = selectedVerses[selectedVerses.length - 1].index;
      }

      setJumpToVerseTargetIndex(lastIndex);
      flatListComponentRef?.scrollToIndex({
        index: lastIndex,
        animated: Settings.animateScrolling
      });
    };

    return <View style={styles.container} pointerEvents={"box-none"}>

      {previousSong === undefined ? undefined :
        <TouchableOpacity style={[styles.buttonBase, styles.button]}
                          onPress={() => goToSongListSong(previousSong)}
                          hitSlop={RectangularInset(20)}>
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
                          onLongPress={jumpToLastVerse}
                          hitSlop={RectangularInset(20)}>
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
                          onPress={() => goToSongListSong(nextSong)}
                          hitSlop={{...RectangularInset(20), left: 10}}>
          <Icon name={"chevron-right"}
                color={styles.buttonText.color as string}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </TouchableOpacity>
      }
    </View>;
  };

export default SongControls;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    paddingHorizontal: 3,
    bottom: 30,
    zIndex: 1
  },

  buttonBase: {
    width: 45,
    height: 45,
    marginHorizontal: 10
  },
  button: {
    backgroundColor: colors.primary.variant,
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
    backgroundColor: colors.button.variant,
    elevation: 2
  },
  buttonInvert: {
    backgroundColor: colors.button.default
  },

  buttonText: {
    color: colors.onPrimary,
    fontSize: 18
  },
  buttonTextDisabled: {
    opacity: 0.3,
    color: colors.text.lighter
  },
  buttonInvertText: {
    color: colors.text.lighter
  },

  horizontalGap: {
    flex: 1
  }
});
