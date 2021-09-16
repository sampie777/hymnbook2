import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Db from "../scripts/db/db";
import { Song } from "../models/Songs";
import { routes } from "../navigation";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";
import Settings from "../scripts/settings";
import SongList from "../scripts/songList/songList";
import { SongSchema } from "../models/SongsSchema";

interface KeyProps {
  onPress: () => void;
  extraStyle?: Object;
}

const Key: React.FC<KeyProps> = ({ children, onPress, extraStyle }) => {
  const keyTextStyle: Array<Object> = [styles.keyText];
  if (extraStyle !== undefined) {
    keyTextStyle.push(extraStyle);
  }

  return (
    <TouchableOpacity style={styles.key}
                      onPress={onPress}>
      <Text style={keyTextStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

const NumberKey: React.FC<{ number: number, onPress: (number: number) => void }> =
  ({ number, onPress }) => (
    <Key onPress={() => onPress(number)}>
      {number}
    </Key>
  );

const SearchResultItem: React.FC<{ song: Song, onPress: (song: Song) => void }> =
  ({ song, onPress }) => {
    const [songAddedToSongList, setSongAddedToSongList] = useState(false);
    const timeout = useRef<NodeJS.Timeout>();

    useFocusEffect(React.useCallback(() =>
      () => { // on blur
        if (timeout.current !== undefined) {
          clearTimeout(timeout.current);
        }
      }, []));

    const addSongToSongList = () => {
      if (songAddedToSongList) {
        return; // Wait for cool down
      }
      SongList.addSong(song);
      setSongAddedToSongList(true);
      timeout.current = setTimeout(() => setSongAddedToSongList(false), 3000);
    };

    return (<TouchableOpacity onPress={() => onPress(song)} style={styles.searchListItem}>
      <Text style={styles.searchListItemText}>{song.name}</Text>

      <TouchableOpacity onPress={addSongToSongList}
                        style={styles.searchListItemButton}>
        <Icon name={songAddedToSongList ? "check" : "plus"}
              size={styles.searchListItemButton.fontSize}
              color={songAddedToSongList
                ? styles.searchListItemButtonHighlight.color
                : styles.searchListItemButton.color} />
      </TouchableOpacity>
    </TouchableOpacity>);
  };

const SearchScreen: React.FC<{ navigation: any }> =
  ({ navigation }) => {
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
      console.log("Searchscreen onFocus", Settings.songScale);
    };

    const onBlur = () => {
      setInputValue("");
      setSearchResult([]);
    };

    useEffect(() => {
      fetchSearchResults();
      return () => undefined;
    }, [inputValue]);

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
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.infoText}>Enter song number:</Text>
          <Text style={styles.inputTextField}>{inputValue}</Text>
        </View>

        <FlatList
          data={results}
          renderItem={renderSearchResultItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.searchList} />

        <View style={styles.keyPad}>
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
            <Key onPress={onClearKeyPress}
                 extraStyle={styles.specialKeyText}>Clear</Key>
            <NumberKey number={0} onPress={onNumberKeyPress} />
            <Key onPress={onDeleteKeyPress}
                 extraStyle={styles.specialKeyText}>
              <Icon name="backspace" size={styles.keyText.fontSize - 10} color={styles.keyText.color} />
            </Key>
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

  inputContainer: {
    flex: 1,
    alignItems: "center",
    flexBasis: "27.5%",
    flexGrow: 0,
    maxHeight: 200
  },
  infoText: {
    fontSize: 18,
    color: "#888",
    paddingTop: 20,
    fontFamily: "sans-serif-light"
  },
  inputTextField: {
    fontSize: 100,
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
  searchListItem: {
    marginBottom: 1,
    backgroundColor: "#fcfcfc",
    borderColor: "#ddd",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  searchListItemText: {
    padding: 15,
    fontSize: 24,
    flex: 1
  },
  searchListItemButton: {
    padding: 15,
    fontSize: 24,
    color: "#9fec9f"
  },
  searchListItemButtonHighlight: {
    color: "#2fd32f"
  },

  keyPad: {
    flex: 1,
    flexBasis: 270,
    flexGrow: 0
  },
  keyPadRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "stretch"
  },
  key: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#eee",
    borderWidth: 1
  },
  keyText: {
    fontSize: 40,
    fontFamily: "sans-serif-thin",
    color: "#555"
  },
  specialKeyText: {
    fontSize: 20,
    fontFamily: "sans-serif-light"
  }
});
