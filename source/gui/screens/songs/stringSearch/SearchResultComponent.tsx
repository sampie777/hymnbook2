import React, { useCallback } from "react";
import { Song, SongMetadataType, Verse } from "../../../../logic/db/models/Songs";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { renderTextWithCustomReplacements } from "../../../components/utils";
import { ParamList, SongRoute, VersePickerMethod, VersePickerRoute } from "../../../../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import VerseSummary from "./VerseSummary";
import MatchedVersesSummary from "./MatchedVersesSummary";

interface Props {
  navigation: NativeStackNavigationProp<ParamList, any>;
  song: Song;
  searchRegex: string;
  showSongBundle?: boolean;
  disable?: boolean;
  isTitleMatch?: boolean;
  isMetadataMatch?: boolean;
  isVerseMatch?: boolean;
}

const SearchResultComponent: React.FC<Props> = ({
                                                  navigation,
                                                  song,
                                                  searchRegex,
                                                  showSongBundle,
                                                  disable = false,
                                                  isTitleMatch = false,
                                                  isMetadataMatch = false,
                                                  isVerseMatch = false
                                                }) => {
  if (searchRegex.length === 0) return null;

  const styles = createStyles(useTheme());

  const getSelectedVerses = () => !isVerseMatch ? []
    : SongSearch.getMatchedVerses(song, searchRegex)
      .map(it => Verse.toObject(it));

  const onPress = () => {
    navigation.navigate(SongRoute, {
      id: song.id,
      highlightText: isVerseMatch ? searchRegex : undefined,
      selectedVerses: getSelectedVerses()
    });
  };

  const onLongPress = () => {
    navigation.navigate(VersePickerRoute, {
      verses: song.verses?.map(it => Verse.toObject(it)),
      selectedVerses: getSelectedVerses(),
      songId: song.id,
      songName: song.name,
      method: VersePickerMethod.ShowSong,
      highlightText: isVerseMatch ? searchRegex : undefined
    });
  };

  const alternativeTitle = !isMetadataMatch ? null
    : song.metadata.find(it =>
      it.type === SongMetadataType.AlternativeTitle
      && RegExp(searchRegex, "i").test(it.value)
    )?.value;

  const createHighlightedTextComponent = useCallback((text: string, index: number) =>
    <Text key={index} style={styles.textHighlighted}>
      {text}
    </Text>, [searchRegex]);

  return <TouchableOpacity style={[styles.container, (disable ? styles.containerDisabled : {})]}
                           onPress={disable ? undefined : onPress}
                           onLongPress={disable ? undefined : onLongPress}>
    <View style={styles.titleContainer}>
      <Text style={styles.songName}>
        {!isTitleMatch ? song.name :
          renderTextWithCustomReplacements(song.name, searchRegex, createHighlightedTextComponent)
        }
        {!showSongBundle ? undefined :
          <Text style={styles.songBundleName}>
            {"  -  "}{Song.getSongBundle(song)?.name}
          </Text>
        }
      </Text>

      {alternativeTitle == null ? undefined :
        <Text style={styles.alternativeTitle}>
          {renderTextWithCustomReplacements(alternativeTitle, searchRegex, createHighlightedTextComponent)}
        </Text>
      }

    </View>

    {song.verses == null || song.verses.length === 0 ? undefined :
      <View style={styles.verseContainer}>
        {isVerseMatch
          ? <MatchedVersesSummary song={song}
                                  searchRegex={searchRegex} />
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
    borderColor: colors.border.default,
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
    color: colors.text.default
  },

  songBundleName: {
    fontSize: 14,
    color: colors.text.lighter,
    fontStyle: "italic"
  },

  alternativeTitle: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.text.lighter,
    fontStyle: "italic"
  },

  verseContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    justifyContent: "flex-start"
  },

  textHighlighted: {
    color: colors.text.highlighted.foreground,
    backgroundColor: colors.text.highlighted.background
  }
});

export default SearchResultComponent;
