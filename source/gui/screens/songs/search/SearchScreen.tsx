import React, { useEffect, useRef, useState } from "react";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs/src/types";
import { ParamList, SongSearchRoute } from "../../../../navigation";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { getFontScale } from "react-native-device-info";
import Settings from "../../../../settings";
import Db from "../../../../logic/db/db";
import config from "../../../../config";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import { SongSchema } from "../../../../logic/db/models/SongsSchema";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { isIOS, isPortraitMode } from "../../../../logic/utils";
import { isTitleSimilarToOtherSongs } from "../../../../logic/songs/utils";
import { useFocusEffect } from "@react-navigation/native";
import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import PopupsComponent from "../../../components/popups/PopupsComponent";
import { BackspaceKey, ClearKey, NumberKey } from "./InputKey";
import { SearchResultItem } from "./SearchResultItem";
import StringSearchButton from "./StringSearchButton";


const SearchScreen: React.FC<BottomTabScreenProps<ParamList, typeof SongSearchRoute>> =
  ({ navigation }) => {
    const previousInputValueRef = useRef("");
    const [inputValue, setInputValue] = useState("");
    const [previousInputValue, setPreviousInputValue] = useState("");
    const [results, setSearchResult] = useState<Array<Song>>([]);
    const [useSmallerFontSize, setUseSmallerFontSize] = useState(false);
    // Use a state for this, so the GUI will be updated when the setting changes in the settings screen
    const [stringSearchButtonPlacement, setStringSearchButtonPlacement] = useState(Settings.stringSearchButtonPlacement);
    const windowDimension = useWindowDimensions();

    const styles = createStyles(useTheme());

    useEffect(() => {
      onLaunch();
      return onExit;
    }, []);

    useEffect(() => {
      requestAnimationFrame(fetchSearchResults);
      return () => undefined;
    }, [inputValue]);

    useFocusEffect(
      React.useCallback(() => {
        onFocus();
        return onBlur;
      }, [])
    );

    const onLaunch = () => {
      getFontScale().then(scale => setUseSmallerFontSize(scale >= 1.4));
    };

    const onExit = () => {
      clearScreen();
    };

    const onFocus = () => {
      setStringSearchButtonPlacement(Settings.stringSearchButtonPlacement);
      if (!Settings.songSearchRememberPreviousEntry) {
        previousInputValueRef.current = "";
      }
    };

    const onBlur = () => {
      if (!Settings.clearSearchAfterAddedToSongList) return;
      // Use timeout to fix the bug on iOS that onLongPress doesn't get dismissed if the touch component gets unmounted
      // This is still needed, even after #162
      setTimeout(() => clearScreen(), 500);
    };

    useEffect(() => {
      // We set the previousInputValue through the ref, as setting the state directly from within
      // storeSelectedSongInformation, iOS will perform the longPress-won't-dismiss bug.
      setPreviousInputValue(previousInputValueRef.current);
    }, [previousInputValueRef.current]);

    const storeSelectedSongInformation = () => {
      if (!Settings.songSearchRememberPreviousEntry) {
        previousInputValueRef.current = "";
      } else if (inputValue) {
        previousInputValueRef.current = inputValue;
      }
    };

    const clearScreen = () => {
      storeSelectedSongInformation();
      setInputValue("");
      setSearchResult([]);
    };

    const onNumberKeyPress = (number: number) => {
      if (inputValue.length >= config.maxSearchInputLength) {
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
      if (inputValue == "") {
        previousInputValueRef.current = "";
        setPreviousInputValue("");
      }
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
        .filtered(`number = ${+query} LIMIT(${config.maxSearchResultsLength})`);

      setSearchResult(results as unknown as Array<Song>);
    };

    const onAddedToSongList = () => {
      storeSelectedSongInformation();
      if (!Settings.clearSearchAfterAddedToSongList) return;
      setInputValue("");
    };

    const isStringSearchButtonsPositionTop = () => {
      return stringSearchButtonPlacement == SongSearch.StringSearchButtonPlacement.TopLeft
        || stringSearchButtonPlacement == SongSearch.StringSearchButtonPlacement.TopRight;
    };

    const isStringSearchButtonsPosition = (position: SongSearch.StringSearchButtonPlacement) => {
      if (stringSearchButtonPlacement == SongSearch.StringSearchButtonPlacement.BottomLeft
        || stringSearchButtonPlacement == SongSearch.StringSearchButtonPlacement.BottomRight) {
        return position == SongSearch.StringSearchButtonPlacement.BottomLeft
          || position == SongSearch.StringSearchButtonPlacement.BottomRight;
      }
      return position == stringSearchButtonPlacement;
    };

    const renderSearchResultItem = ({ item }: { item: Song }) => (
      <SearchResultItem navigation={navigation}
                        song={item}
                        beforeNavigating={storeSelectedSongInformation}
                        onAddedToSongList={onAddedToSongList}
                        showSongBundle={isTitleSimilarToOtherSongs(item, results)} />
    );

    const onInputTextPress = () => {
      setInputValue(previousInputValue);
    }

    return (
      <View style={[styles.container, isPortraitMode(windowDimension) ? {} : stylesLandscape.container]}>
        <PopupsComponent navigation={navigation} />

        <View style={[styles.inputAndResults, isPortraitMode(windowDimension) ? {} : stylesLandscape.inputAndResults]}>
          <View style={styles.topContainer}>
            {!isStringSearchButtonsPositionTop() ? undefined :
              <View style={styles.topContainerSide}>
                {!isStringSearchButtonsPosition(SongSearch.StringSearchButtonPlacement.TopLeft)
                || inputValue.length > 0 || results.length > 0 ? undefined :
                  <StringSearchButton navigation={navigation}
                                      position={stringSearchButtonPlacement} />
                }
              </View>
            }

            <View style={styles.topContainerCenter}>
              <Text style={[styles.infoText, (!useSmallerFontSize ? {} : styles.infoTextSmaller)]}>Enter song
                number:</Text>

              <View style={styles.inputTextView}>
                <View style={styles.inputTextViewContainer}>
                  <Text onPress={onInputTextPress}
                    style={[styles.inputTextField, (!useSmallerFontSize ? {} : styles.inputTextFieldSmaller)]}>
                    {inputValue ? inputValue
                      : (!Settings.songSearchRememberPreviousEntry ? " " :
                          <>{isIOS ? "" : " "}<Text
                            style={styles.inputTextFieldPlaceholder}>{previousInputValue}</Text> </>
                      )
                    }
                  </Text>
                </View>
              </View>
            </View>

            {!isStringSearchButtonsPositionTop() ? undefined :
              <View style={styles.topContainerSide}>
                {!isStringSearchButtonsPosition(SongSearch.StringSearchButtonPlacement.TopRight)
                || inputValue.length > 0 || results.length > 0 ? undefined :
                  <StringSearchButton navigation={navigation}
                                      position={stringSearchButtonPlacement} />
                }
              </View>
            }
          </View>

          <FlatList
            data={results}
            renderItem={renderSearchResultItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.searchList} />

          {isStringSearchButtonsPositionTop()
          || inputValue.length > 0 || results.length > 0 ? undefined :
            <StringSearchButton navigation={navigation}
                                position={stringSearchButtonPlacement} />
          }
        </View>

        <View style={[styles.keyPad,
          (!useSmallerFontSize ? {} : styles.keyPadSmaller),
          (isPortraitMode(windowDimension) ? {} : stylesLandscape.keyPad)
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
            <BackspaceKey onPress={onDeleteKeyPress}
                          onLongPress={onClearKeyPress}
                          useSmallerFontSize={useSmallerFontSize} />
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

  topContainer: {
    flexDirection: "row",
    marginBottom: 5
  },
  topContainerSide: {
    width: 75,  // Width calculated based on StringSearchButton
    alignItems: "center",
    justifyContent: "flex-start"
  },
  topContainerCenter: {
    flex: 1,
    alignItems: "center"
  },

  infoText: {
    fontSize: 18,
    color: colors.text.default,
    paddingTop: 20,
    fontFamily: fontFamily.sansSerifLight,
    textAlign: "center"
  },
  infoTextSmaller: {
    fontSize: 14
  },
  inputTextView: {
    flexDirection: "row",
    alignItems: "center"
  },
  inputTextViewContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: isDark ? "#404040" : "#ddd"
  },
  inputTextField: {
    fontSize: 70,
    textAlign: "center",
    fontFamily: fontFamily.sansSerifLight,
    color: colors.text.light,
    borderStyle: "solid",
    minWidth: 140
  },
  inputTextFieldPlaceholder: {
    color: isDark ? (isIOS ? "#303030" : "#2a2a2a00") : "#e5e5e5",
    textShadowColor: isDark ? (isIOS ? "#404040" : "#404040aa") : "#ddd",
    textShadowRadius: 12
  },
  inputTextFieldSmaller: {
    fontSize: 40
  },

  searchList: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 10
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
