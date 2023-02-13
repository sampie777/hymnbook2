import React, { useCallback } from "react";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { renderTextWithCustomReplacements } from "../../../components/utils";
import { ParamList, SongRoute, VersePickerMethod, VersePickerRoute } from "../../../../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import VerseSummary from "./VerseSummary";
import MatchedVersesSummary from "./MatchedVersesSummary";

interface Props {
  navigation: NativeStackNavigationProp<ParamList, any>;
  song: Song;
  searchText: string;
  showSongBundle?: boolean;
  disable?: boolean;
  isTitleMatch?: boolean;
  isVerseMatch?: boolean;
}

const SearchResultComponent: React.FC<Props> = ({
                                                  navigation,
                                                  song,
                                                  searchText,
                                                  showSongBundle,
                                                  disable = false,
                                                  isTitleMatch = false,
                                                  isVerseMatch = false
                                                }) => {
  if (searchText.length === 0) return null;

  const styles = createStyles(useTheme());

  const getSelectedVerses = () => !isVerseMatch ? []
    : SongSearch.getMatchedVerses(song, searchText)
      .map(it => Verse.toObject(it));

  const onPress = () => {
    navigation.navigate(SongRoute, {
      id: song.id,
      highlightText: isVerseMatch ? searchText : undefined,
      selectedVerses: getSelectedVerses()
    });
  };

  const onLongPress = () => {
    navigation.navigate(VersePickerRoute, {
      verses: song.verses?.map(it => Verse.toObject(it)),
      selectedVerses: getSelectedVerses(),
      songId: song.id,
      method: VersePickerMethod.ShowSong,
      highlightText: isVerseMatch ? searchText : undefined
    });
  };

  const createHighlightedTextComponent = useCallback((text: string, index: number) =>
    <Text key={index} style={styles.textHighlighted}>
      {text}
    </Text>, [searchText]);

  return <TouchableOpacity style={[styles.container, (disable ? styles.containerDisabled : {})]}
                           onPress={disable ? undefined : onPress}
                           onLongPress={disable ? undefined : onLongPress}>
    <View style={styles.titleContainer}>
      <Text style={styles.songName}>
        {!isTitleMatch ? song.name :
          renderTextWithCustomReplacements(song.name, searchText, createHighlightedTextComponent)
        }
      </Text>

      {!showSongBundle ? undefined :
        <Text style={styles.songBundleName}>
          {Song.getSongBundle(song)?.name}
        </Text>
      }
    </View>

    {song.verses == null || song.verses.length === 0 ? undefined :
      <View style={styles.verseContainer}>
        {isVerseMatch
          ? <MatchedVersesSummary song={song}
                                  searchText={searchText} />
          : <VerseSummary verse={song.verses[0]}
                          maxLines={2}
                          searchText={undefined} />
        }
      </View>
    }
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderColor: colors.border,
    paddingHorizontal: 10,
    backgroundColor: colors.surface1,
    marginBottom: 5
  },
  containerDisabled: {
    opacity: 0.4
  },

  titleContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 4
  },

  songName: {
    paddingTop: 2,
    paddingHorizontal: 15,
    fontSize: 18,
    color: colors.text
  },

  songBundleName: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.textLighter,
    fontStyle: "italic"
  },

  verseContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    justifyContent: "flex-start"
  },

  textHighlighted: {
    color: colors.textHighlightedForeground,
    backgroundColor: colors.textHighlightedBackground
  }
});

export default SearchResultComponent;
