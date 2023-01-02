import React, { useEffect, useRef, useState } from "react";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs/src/types";
import { ParamList, SongRoute, SongSearchRoute, VersePickerMethod, VersePickerRoute } from "../../../../navigation";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { getFontScale } from "react-native-device-info";
import Settings from "../../../../settings";
import Db from "../../../../logic/db/db";
import config from "../../../../config";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import { SongSchema } from "../../../../logic/db/models/SongsSchema";
import { isIOS, isPortraitMode } from "../../../../logic/utils";
import { isTitleSimilarToOtherSongs } from "../../../../logic/songs/utils";
import { useFocusEffect } from "@react-navigation/native";
import {
  Dimensions,
  EmitterSubscription,
  FlatList,
  ScaledSize,
  StyleSheet,
  Text,
  View
} from "react-native";
import PopupsComponent from "../../../components/popups/PopupsComponent";
import { BackspaceKey, ClearKey, NumberKey } from "./InputKey";
import { SearchResultItem } from "./SearchResultItem";


const SearchScreen: React.FC<BottomTabScreenProps<ParamList, typeof SongSearchRoute>> =
  ({ navigation }) => {
    const dimensionChangeEventSubscription = useRef<EmitterSubscription>();
    const [isPortrait, setIsPortrait] = useState(isPortraitMode(Dimensions.get("window")));
    const [inputValue, setInputValue] = useState("");
    const [results, setSearchResult] = useState<Array<Song>>([]);
    const [useSmallerFontSize, setUseSmallerFontSize] = useState(false);

    const styles = createStyles(useTheme());
    const maxInputLength = config.maxSearchInputLength;
    const maxResultsLength = config.maxSearchResultsLength;

    useEffect(() => {
      onLaunch();
      return onExit;
    }, []);

    useEffect(() => {
      fetchSearchResults();
      return () => undefined;
    }, [inputValue]);

    useFocusEffect(
      React.useCallback(() => {
        onFocus();
        return onBlur;
      }, [])
    );

    const onLaunch = () => {
      dimensionChangeEventSubscription.current = Dimensions.addEventListener("change", handleDimensionsChange);
      getFontScale().then(scale => setUseSmallerFontSize(scale >= 1.4));
    };

    const onExit = () => {
      clearScreen();
      dimensionChangeEventSubscription.current?.remove();
    };

    const onFocus = () => {
      // This listener fixes the problem where the app is closed in landscape
      // and opened in portrait, but than this screens still thinks it's in landscape
      handleDimensionsChange({ window: Dimensions.get("window") });
    };

    const onBlur = () => {
      if (isIOS) {
        // Use timeout to fix the bug on iOS that onLongPress doesn't get dismissed if the touch component gets unmounted
        setTimeout(() => clearScreen(), 500);
      } else {
        clearScreen();
      }
    };

    const clearScreen = () => {
      setInputValue("");
      setSearchResult([]);
    };

    const handleDimensionsChange = (e: { window: ScaledSize; screen?: ScaledSize; }) => {
      setIsPortrait(isPortraitMode(e.window));
    };

    const onNumberKeyPress = (number: number) => {
      if (inputValue.length >= maxInputLength) {
        return;
      }

      setInputValue(inputValue + number);
    };

    const onDeleteKeyPress = () => {
      if (inputValue.length <= 1) {
        setInputValue("");
        return;
      }

      setInputValue(inputValue.substring(0, inputValue.length - 1));
    };

    const onClearKeyPress = () => {
      setInputValue("");
    };

    const fetchSearchResults = () => {
      if (!Db.songs.isConnected()) {
        return;
      }
      const query = inputValue;

      if (query.length === 0) {
        setSearchResult([]);
        return;
      }

      const results = Db.songs.realm().objects<Song>(SongSchema.name)
        .sorted("name")
        .filtered(`number = ${query} OR name LIKE "* ${query}" OR name LIKE "* ${query} *" LIMIT(${maxResultsLength})`);

      setSearchResult(results as unknown as Array<Song>);
    };

    const onSearchResultItemPress = (song: Song) => {
      navigation.navigate(SongRoute, { id: song.id });
    };

    const onSearchResultItemLongPress = (song: Song) => {
      navigation.navigate(VersePickerRoute, {
        verses: song.verses?.map(it => Verse.toObject(it)),
        selectedVerses: [],
        songId: song.id,
        method: VersePickerMethod.ShowSong
      });
    };

    const onAddedToSongList = () => {
      if (!Settings.clearSearchAfterAddedToSongList) return;
      setInputValue("");
    };

    const renderSearchResultItem = ({ item }: { item: Song }) => (
      <SearchResultItem navigation={navigation}
                        song={item}
                        onPress={onSearchResultItemPress}
                        onLongPress={onSearchResultItemLongPress}
                        onAddedToSongList={onAddedToSongList}
                        showSongBundle={isTitleSimilarToOtherSongs(item, results)} />
    );

    return (
      <View style={[styles.container, isPortrait ? {} : stylesLandscape.container]}>
        <PopupsComponent navigation={navigation} />

        <View style={[styles.inputAndResults, isPortrait ? {} : stylesLandscape.inputAndResults]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.infoText, (!useSmallerFontSize ? {} : styles.infoTextSmaller)]}>Enter song
              number:</Text>

            <View style={styles.inputTextView}>
              <View style={styles.inputTextViewContainer}>
                <Text
                  style={[styles.inputTextField, (!useSmallerFontSize ? {} : styles.inputTextFieldSmaller)]}>{inputValue}</Text>
              </View>
            </View>
          </View>

          <FlatList
            data={results}
            renderItem={renderSearchResultItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.searchList} />
        </View>

        <View style={[styles.keyPad,
          (!useSmallerFontSize ? {} : styles.keyPadSmaller),
          (isPortrait ? {} : stylesLandscape.keyPad)
        ]}>
          <View style={styles.keyPadRow}>
            <NumberKey number={1} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
            <NumberKey number={2} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
            <NumberKey number={3} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
          </View>
          <View style={styles.keyPadRow}>
            <NumberKey number={4} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
            <NumberKey number={5} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
            <NumberKey number={6} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
          </View>
          <View style={styles.keyPadRow}>
            <NumberKey number={7} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
            <NumberKey number={8} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
            <NumberKey number={9} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
          </View>
          <View style={styles.keyPadRow}>
            <ClearKey onPress={onClearKeyPress} useSmallerFontSize={useSmallerFontSize} />
            <NumberKey number={0} onPress={onNumberKeyPress} useSmallerFontSize={useSmallerFontSize} />
            <BackspaceKey onPress={onDeleteKeyPress} useSmallerFontSize={useSmallerFontSize} />
          </View>
        </View>
      </View>
    );
  };

export default SearchScreen;

const createStyles = ({ isDark, colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "stretch",
    backgroundColor: colors.background
  },

  inputAndResults: {
    flex: 1
  },

  inputContainer: {
    alignItems: "center"
  },
  infoText: {
    fontSize: 18,
    color: colors.text,
    paddingTop: 20,
    fontFamily: fontFamily.sansSerifLight
  },
  infoTextSmaller: {
    fontSize: 14
  },
  inputTextView: {
    flexDirection: "row",
    alignItems: "center"
  },
  inputTextViewContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center"
  },
  inputTextField: {
    fontSize: 70,
    textAlign: "center",
    fontFamily: fontFamily.sansSerifLight,
    color: colors.textLight,
    borderStyle: "solid",
    borderBottomWidth: 2,
    borderBottomColor: isDark ? "#404040" : "#ddd",
    minWidth: 140
  },
  inputTextFieldSmaller: {
    fontSize: 40
  },

  searchList: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 10,
    paddingTop: 20
  },

  keyPad: {
    height: 275,
    minHeight: "40%",
    maxHeight: "50%"
  },
  keyPadSmaller: {
    height: 230
  },
  keyPadRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "stretch"
  }
});

const stylesLandscape = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch"
  },

  inputAndResults: {
    flex: 1
  },

  keyPad: {
    flex: 1,
    height: "100%",
    maxHeight: "100%"
  }
});
