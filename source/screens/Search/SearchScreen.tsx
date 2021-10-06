import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Platform, StyleSheet, Text, View } from "react-native";
import Db from "../../scripts/db/db";
import { Song } from "../../models/Songs";
import { routes } from "../../navigation";
import { useFocusEffect } from "@react-navigation/native";
import Settings from "../../scripts/settings";
import { SongSchema } from "../../models/SongsSchema";
import { BackspaceKey, ClearKey, Key, NumberKey } from "./InputKey";
import { SearchResultItem } from "./SearchResultItem";
import { isPortraitMode } from "../../scripts/utils";


const SearchScreen: React.FC<{ navigation: any }> =
  ({ navigation }) => {
    const [isPortrait, setIsPortrait] = useState(isPortraitMode(Dimensions.get("window")));
    const [inputValue, setInputValue] = useState("");
    const [results, setSearchResult] = useState<Array<Song>>([]);

    const maxInputLength = Settings.maxSearchInputLength;
    const maxResultsLength = Settings.maxSearchResultsLength;

    useFocusEffect(
      React.useCallback(() => {
        onFocus();
        return onBlur;
      }, [])
    );

    const onFocus = () => {
    };

    const onBlur = () => {
      setInputValue("");
      setSearchResult([]);
    };

    useEffect(() => {
      checkIfIsPortraitMode();
      fetchSearchResults();
      return () => undefined;
    }, [inputValue]);

    const checkIfIsPortraitMode = () => {
      Dimensions.addEventListener("change", (e) => {
        setIsPortrait(isPortraitMode(e.window));
      });
    }

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

      const results = Db.songs.realm().objects(SongSchema.name)
        .sorted("name")
        .filtered(`name LIKE "* ${query}" OR name LIKE "* ${query} *" LIMIT(${maxResultsLength})`);

      setSearchResult(results as unknown as Array<Song>);
    };

    const onSearchResultItemPress = (song: Song) => {
      navigation.navigate(routes.Song, { id: song.id });
    };

    const renderSearchResultItem = ({ item }: { item: Song }) => (
      <SearchResultItem song={item} onPress={onSearchResultItemPress} />
    );

    return (
      <View style={[styles.container, isPortrait ? {} : stylesLandscape.container]}>
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
    flex: 1,
  },

  inputContainer: {
    alignItems: "center",
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
    maxHeight: "50%",
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
    alignItems: "stretch",
  },

  inputAndResults: {
    flex: 1,
  },

  keyPad: {
    flex: 1,
    height: "100%",
    maxHeight: "100%",
  }
});