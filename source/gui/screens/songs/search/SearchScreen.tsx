import React, { useEffect, useMemo, useRef, useState } from "react";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs/src/types";
import { ParamList, SongSearchRoute } from "../../../../navigation";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { getFontScale } from "react-native-device-info";
import Settings from "../../../../settings";
import Db from "../../../../logic/db/db";
import { Song } from "../../../../logic/db/models/songs/Songs";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { isPortraitMode } from "../../../../logic/utils";
import { isTitleSimilarToOtherSongs } from "../../../../logic/songs/utils";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import PopupsComponent from "../../../components/popups/PopupsComponent";
import { SearchResultItem } from "./SearchResultItem";
import StringSearchButton from "./StringSearchButton";
import DownloadInstructions from "./DownloadInstructions";
import KeyPad from "./KeyPad";
import SearchHeading from "./SearchHeading";
import EasterEggList from "./easterEggs/EasterEggList";


const SearchScreen: React.FC<BottomTabScreenProps<ParamList, typeof SongSearchRoute>> =
  ({ navigation }) => {
    const previousInputValueRef = useRef("");
    const [inputValue, setInputValue] = useState("");
    const [previousInputValue, setPreviousInputValue] = useState("");
    const [results, setSearchResult] = useState<Song[]>([]);
    const [selectedBundleUuids, setSelectedBundleUuids] = useState<string[]>(Settings.songSearchSelectedBundlesUuids);
    const [useSmallerFontSize, setUseSmallerFontSize] = useState(false);
    // Use a state for this, so the GUI will be updated when the setting changes in the settings screen
    const [stringSearchButtonPlacement, setStringSearchButtonPlacement] = useState(Settings.stringSearchButtonPlacement);
    const windowDimension = useWindowDimensions();

    const styles = createStyles(useTheme());

    useEffect(() => {
      // onLaunch
      getFontScale().then(scale => setUseSmallerFontSize(scale >= 1.4));

      // onExit
      return clearScreen;
    }, []);

    useFocusEffect(React.useCallback(() => {
      onFocus();
      return onBlur;
    }, []));

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
      requestAnimationFrame(fetchSearchResults);
    }, [inputValue, selectedBundleUuids]);

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

    const fetchSearchResults = () => {
      if (!Db.songs.isConnected()) return;
      const query = inputValue;

      if (query.length === 0) {
        setSearchResult([]);
        return;
      }

      const results = SongSearch.findByNumber(+query, selectedBundleUuids);
      setSearchResult(results as unknown as Array<Song>);
    };

    const onAddedToSongList = () => {
      storeSelectedSongInformation();
      if (!Settings.clearSearchAfterAddedToSongList) return;
      setInputValue("");
    };

    const onInputTextPress = () => setInputValue(previousInputValue);

    const isStringSearchButtonsPositionTop = () =>
      stringSearchButtonPlacement == SongSearch.StringSearchButtonPlacement.TopLeft;

    const keyPadExtraStyles = useMemo(() => isPortraitMode(windowDimension) ? {} : stylesLandscape.keyPad, [windowDimension]);

    const renderSearchResultItem = ({ item }: { item: Song }) => (
      <SearchResultItem navigation={navigation}
                        song={item}
                        beforeNavigating={storeSelectedSongInformation}
                        onAddedToSongList={onAddedToSongList}
                        showSongBundle={isTitleSimilarToOtherSongs(item, results)} />
    );

    return <View style={[styles.container, isPortraitMode(windowDimension) ? {} : stylesLandscape.container]}>
      <PopupsComponent navigation={navigation} />

      <View style={[styles.inputAndResults, isPortraitMode(windowDimension) ? {} : stylesLandscape.inputAndResults]}>
        <SearchHeading value={inputValue}
                       previousValue={previousInputValue}
                       navigation={navigation}
                       onPress={onInputTextPress}
                       results={results}
                       stringSearchButtonPlacement={stringSearchButtonPlacement}
                       useSmallerFontSize={useSmallerFontSize}
                       selectedBundleUuids={selectedBundleUuids}
                       setSelectedBundleUuids={setSelectedBundleUuids} />

        {inputValue == "0000"
          ? <EasterEggList contentContainerStyle={styles.searchList}
                           navigation={navigation}
                           selectedBundleUuids={selectedBundleUuids} />
          : <FlatList
            data={results}
            renderItem={renderSearchResultItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.searchList}
            importantForAccessibility={results.length > 0 ? undefined : "no"} />
        }

        {isStringSearchButtonsPositionTop()
        || inputValue.length > 0 || results.length > 0 ? undefined :
          <StringSearchButton navigation={navigation}
                              position={stringSearchButtonPlacement} />
        }

        <DownloadInstructions navigation={navigation} />
      </View>

      <KeyPad
        useSmallerFontSize={useSmallerFontSize}
        extraStylesContainer={keyPadExtraStyles}
        setInputValue={setInputValue} />
    </View>
  };

export default SearchScreen;

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
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
