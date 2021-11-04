import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, ScaledSize, StyleSheet, Text, View } from "react-native";
import Db from "../../scripts/db/db";
import { Song } from "../../models/Songs";
import { SongRouteParams, routes } from "../../navigation";
import { useFocusEffect } from "@react-navigation/native";
import Settings from "../../scripts/settings";
import { SongSchema } from "../../models/SongsSchema";
import { BackspaceKey, ClearKey, NumberKey } from "./InputKey";
import { SearchResultItem } from "./SearchResultItem";
import { isPortraitMode } from "../../scripts/utils";
import PopupsComponent from "../../components/Popups/PopupsComponent";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";


const SearchScreen: React.FC<{ navigation: BottomTabNavigationProp<any> }> =
  ({ navigation }) => {
    const [isPortrait, setIsPortrait] = useState(isPortraitMode(Dimensions.get("window")));
    const [inputValue, setInputValue] = useState("");
    const [results, setSearchResult] = useState<Array<Song>>([]);

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

    // This listener fixes the problem where the app is closed in landscape
    // and opened in portrait, but than this screens still thinks it's in landscape
    useFocusEffect(
      React.useCallback(() => {
        handleDimensionsChange({window: Dimensions.get("window")});
      }, [])
    );

    const onLaunch = () => {
      Dimensions.addEventListener("change", handleDimensionsChange);
    };

    const onExit = () => {
      setInputValue("");
      setSearchResult([]);
      Dimensions.removeEventListener("change", handleDimensionsChange);
    };

    const handleDimensionsChange = (e: { window: ScaledSize; screen?: ScaledSize; }) => {
      setIsPortrait(isPortraitMode(e.window));
      navigation.setOptions({
        headerShown: isPortraitMode(e.window)
      });
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

    const renderSearchResultItem = ({ item }: { item: Song }) => (
      <SearchResultItem song={item} onPress={onSearchResultItemPress} />
    );

    return (
      <View style={[styles.container, isPortrait ? {} : stylesLandscape.container]}>
        <PopupsComponent navigation={navigation} />

        <View style={[styles.inputAndResults, isPortrait ? {} : stylesLandscape.inputAndResults]}>
          <View style={styles.inputContainer}>
            <Text style={styles.infoText}>Enter song number:</Text>
            <Text style={styles.inputTextField}>{inputValue}</Text>
          </View>

          <FlatList
            data={results}
            renderItem={renderSearchResultItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.searchList} />
        </View>

        <View style={[styles.keyPad, isPortrait ? {} : stylesLandscape.keyPad]}>
          <View style={styles.keyPadRow}>
            <NumberKey number={1} onPress={onNumberKeyPress} />
            <NumberKey number={2} onPress={onNumberKeyPress} />
            <NumberKey number={3} onPress={onNumberKeyPress} />
          </View>
          <View style={styles.keyPadRow}>
            <NumberKey number={4} onPress={onNumberKeyPress} />
            <NumberKey number={5} onPress={onNumberKeyPress} />
            <NumberKey number={6} onPress={onNumberKeyPress} />
          </View>
          <View style={styles.keyPadRow}>
            <NumberKey number={7} onPress={onNumberKeyPress} />
            <NumberKey number={8} onPress={onNumberKeyPress} />
            <NumberKey number={9} onPress={onNumberKeyPress} />
          </View>
          <View style={styles.keyPadRow}>
            <ClearKey onPress={onClearKeyPress} />
            <NumberKey number={0} onPress={onNumberKeyPress} />
            <BackspaceKey onPress={onDeleteKeyPress} />
          </View>
        </View>
      </View>
    );
  };

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "stretch"
  },

  inputAndResults: {
    flex: 1
  },

  inputContainer: {
    alignItems: "center"
  },
  infoText: {
    fontSize: 18,
    color: "#888",
    paddingTop: 20,
    fontFamily: "sans-serif-light"
  },
  inputTextField: {
    fontSize: 90,
    fontFamily: "sans-serif-light",
    color: "#555",
    borderStyle: "dashed",
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
    minWidth: 140,
    paddingLeft: 40,
    paddingRight: 40
  },

  searchList: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 10,
    paddingTop: 20
  },

  keyPad: {
    height: 300,
    minHeight: "40%",
    maxHeight: "50%"
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
