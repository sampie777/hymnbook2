import React, { useEffect, useState } from "react";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { SongRouteParams, routes } from "../../navigation";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { getFontScale } from "react-native-device-info";
import Settings from "../../settings";
import Db from "../../scripts/db/db";
import { Song } from "../../models/Songs";
import { SongSchema } from "../../models/SongsSchema";
import { isPortraitMode } from "../../scripts/utils";
import { useFocusEffect } from "@react-navigation/native";
import { Dimensions, FlatList, ScaledSize, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import PopupsComponent from "../../components/Popups/PopupsComponent";
import { BackspaceKey, ClearKey, NumberKey } from "./InputKey";
import { SearchResultItem } from "./SearchResultItem";


const SearchScreen: React.FC<{ navigation: BottomTabNavigationProp<any> }> =
  ({ navigation }) => {
    const [isPortrait, setIsPortrait] = useState(isPortraitMode(Dimensions.get("window")));
    const [inputValue, setInputValue] = useState("");
    const [results, setSearchResult] = useState<Array<Song>>([]);
    const [useSmallerFontSize, setUseSmallerFontSize] = useState(false);

    const theme = useTheme();
    const styles = createStyles(theme);
    const maxInputLength = Settings.maxSearchInputLength;
    const maxResultsLength = Settings.maxSearchResultsLength;

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
      Dimensions.addEventListener("change", handleDimensionsChange);
      getFontScale().then(scale => setUseSmallerFontSize(scale >= 1.4));
    };

    const onExit = () => {
      setInputValue("");
      setSearchResult([]);
      Dimensions.removeEventListener("change", handleDimensionsChange);
    };

    const onFocus = () => {
      // This listener fixes the problem where the app is closed in landscape
      // and opened in portrait, but than this screens still thinks it's in landscape
      handleDimensionsChange({ window: Dimensions.get("window") });
    };

    const onBlur = () => {
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
        .filtered(`name LIKE "* ${query}" OR name LIKE "* ${query} *" LIMIT(${maxResultsLength})`);

      setSearchResult(results as unknown as Array<Song>);
    };

    const onSearchResultItemPress = (song: Song) => {
      navigation.navigate(routes.Song, { id: song.id } as SongRouteParams);
    };

    const onDocumentPress = () => {
      if (!Settings.enableDocumentsFeatureSwitch) {
        return;
      }

      navigation.navigate(routes.DocumentSearch);
    };

    const onAddedToSongList = () => {
      if (!Settings.clearSearchAfterAddedToSongList) return;
      setInputValue("");
    };

    const renderSearchResultItem = ({ item }: { item: Song }) => (
      <SearchResultItem song={item}
                        onPress={onSearchResultItemPress}
                        onAddedToSongList={onAddedToSongList} />
    );

    return (
      <View style={[styles.container, isPortrait ? {} : stylesLandscape.container]}>
        <PopupsComponent navigation={navigation} />

        <View style={[styles.inputAndResults, isPortrait ? {} : stylesLandscape.inputAndResults]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.infoText, (!useSmallerFontSize ? {} : styles.infoTextSmaller)]}>Enter song
              number:</Text>

            <View style={styles.inputTextView}>
              <View style={styles.documentIconContainer} />

              <View style={styles.inputTextViewContainer}>
                <Text
                  style={[styles.inputTextField, (!useSmallerFontSize ? {} : styles.inputTextFieldSmaller)]}>{inputValue}</Text>
              </View>

              <TouchableOpacity style={styles.documentIconContainer}
                                onPress={onDocumentPress}>
                {!Settings.enableDocumentsFeatureSwitch ? undefined : <>
                  <Icon name={"arrow-right"} style={styles.documentIconArrow} />
                  <Icon name={"file-alt"} style={styles.documentIcon} />
                </>}
              </TouchableOpacity>
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

const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
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
    fontFamily: "sans-serif-light"
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
    fontFamily: "sans-serif-light",
    color: colors.textLight,
    borderStyle: "dashed",
    borderBottomWidth: 2,
    borderBottomColor: isDark ? "#404040" : "#ddd",
    minWidth: 140
  },
  inputTextFieldSmaller: {
    fontSize: 40
  },

  documentIconContainer: {
    width: 80,
    paddingRight: 40,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  documentIconArrow: {
    fontSize: 15,
    color: colors.textLighter,
    paddingRight: 2
  },
  documentIcon: {
    fontSize: 30,
    color: colors.textLighter
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
