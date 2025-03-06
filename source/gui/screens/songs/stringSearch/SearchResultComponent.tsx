import React, { memo, useCallback } from "react";
import { Song, SongMetadataType, Verse } from "../../../../logic/db/models/songs/Songs";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { renderTextWithCustomReplacements } from "../../../components/utils";
import { ParamList, SongRoute, VersePickerMethod, VersePickerRoute } from "../../../../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import VerseSummary from "./VerseSummary";
import MatchedVersesSummary from "./MatchedVersesSummary";
import { isSongValid } from "../../../../logic/songs/utils";

interface Props {
  navigation: NativeStackNavigationProp<ParamList, any>;
  song: Song & Realm.Object<Song>;
  searchRegex: string;
  showSongBundle?: boolean;
  disable?: boolean;
  isTitleMatch?: boolean;
  isMetadataMatch?: boolean;
  isVerseMatch?: boolean;
}

const SearchResultComponent: React.FC<Props> = memo(({
                                                  navigation,
                                                  song,
                                                  searchRegex,
                                                  showSongBundle,
                                                  disable = false,
                                                  isTitleMatch = false,
                                                  isMetadataMatch = false,
                                                  isVerseMatch = false
                                                }) => {
  const styles = createStyles(useTheme());
  if (!isSongValid(song)) return null;

  const getSelectedVerses = () => !isVerseMatch ? []
    : SongSearch.getMatchedVerses(song, searchRegex)
      .map(it => Verse.toObject(it));

  const checkIfSongIsStillValid = () => {
    if (!isSongValid(song)) {
      Alert.alert("Just a moment", "This song has been updated. Please reload the search results.");
      return false;
    }
    return true;
  }

  const onPress = () => {
    if (!checkIfSongIsStillValid()) return;

    navigation.navigate(SongRoute, {
      id: song.id,
      uuid: song.uuid,
      highlightText: isVerseMatch ? searchRegex : undefined,
      selectedVerses: getSelectedVerses()
    });
  };

  const onLongPress = () => {
    if (!checkIfSongIsStillValid()) return;

    navigation.navigate(VersePickerRoute, {
      verses: song.verses?.map(it => Verse.toObject(it)),
      selectedVerses: getSelectedVerses(),
      songId: song.id,
      songUuid: song.uuid,
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
      <Text style={styles.songName}
            importantForAccessibility={"auto"}>
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
        <Text style={styles.alternativeTitle}
              importantForAccessibility={"auto"}>
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
});

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
