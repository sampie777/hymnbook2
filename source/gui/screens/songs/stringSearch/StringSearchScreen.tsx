import React, { useEffect, useRef, useState } from "react";
import Db from "../../../../logic/db/db";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { debounce } from "../../../components/utils";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamList, SongStringSearchRoute } from "../../../../navigation";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { FlatList, StyleSheet, Text, View } from "react-native";
import SearchInput from "../../documents/search/SearchInput";
import SearchOptions from "./SearchOptions";
import SearchResult from "./SearchResult";

interface Props {
  navigation: NativeStackNavigationProp<ParamList, typeof SongStringSearchRoute>;
}

const StringSearchScreen: React.FC<Props> = ({ navigation }) => {
  let isMounted = true;
  const immediateSearchText = useRef(""); // Var for keeping track of search text, which can be used outside the React state scope, like the timed out database fetch function
  const [searchText, setSearchText] = useState("");
  const [searchInTitles, setSearchInTitles] = useState(true);
  const [searchInVerses, setSearchInVerses] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SongSearch.SearchResult[]>([]);

  const styles = createStyles(useTheme());

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
    isMounted = true;
  };

  const onExit = () => {
    isMounted = false;
    setSearchText("");
  };

  useFocusEffect(React.useCallback(() => {
    onFocus();
    return onBlur;
  }, []));

  const onFocus = () => {
    isMounted = true;
  };

  const onBlur = () => {
    isMounted = false;
  };

  function clearSearch() {
    setSearchResults([]);
    setIsLoading(false);
  }

  useEffect(() => {
    immediateSearchText.current = searchText;

    if (!isMounted) return;

    if (!Db.songs.isConnected()) {
      return;
    }

    if (searchText.length === 0) {
      clearSearch();
      return;
    }

    setIsLoading(true);
    requestAnimationFrame(fetchSearchResultsDebounced);
  }, [searchText, searchInTitles, searchInVerses]);

  const fetchSearchResults = () => {
    if (!isMounted) return;

    if (immediateSearchText.current.length === 0) {
      clearSearch();
      return;
    }

    const results = SongSearch.find(immediateSearchText.current, searchInTitles, searchInVerses);

    if (!isMounted) return;

    if (immediateSearchText.current.length === 0) {
      clearSearch();
      return;
    }

    setSearchResults(results);
    setIsLoading(false);
  };

  const fetchSearchResultsDebounced = debounce(fetchSearchResults, 300);

  const renderContentItem = ({ item }: { item: SongSearch.SearchResult }) => {
    return <SearchResult navigation={navigation}
                         song={item.song}
                         searchText={searchText}
                         showSongBundle={false}
                         disable={isLoading} />;
  };

  return <View style={styles.container}>
    <SearchInput value={searchText}
                 onChange={setSearchText}
                 autoFocus={true} />
    <SearchOptions isTitleActive={searchInTitles}
                   isVerseActive={searchInVerses}
                   onTitlePress={() => setSearchInTitles(!searchInTitles)}
                   onVersePress={() => setSearchInVerses(!searchInVerses)} />

    <FlatList style={styles.listContainer}
              onRefresh={isLoading ? () => undefined : undefined} // Hack to show loading icon when loading
              refreshing={isLoading}
              data={searchResults.sort((a, b) => b.points - a.points)}
              renderItem={renderContentItem}
              initialNumToRender={30}
              keyExtractor={(it: SongSearch.SearchResult) => it.song.id.toString()}
              ListHeaderComponent={
                <Text style={styles.resultsInfoText}>
                  {isLoading ? "Searching..." :
                    <>{searchResults.length === 0 ? "No" : searchResults.length} results</>
                  }
                </Text>
              }
              ListFooterComponent={<View style={styles.listFooter} />} />
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "stretch",
    backgroundColor: colors.background,
    paddingTop: 10
  },
  listContainer: {
    flex: 1,
    marginTop: 15
  },
  resultsInfoText: {
    color: colors.textLighter,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 5,
    marginBottom: 15,
    fontSize: 13
  },
  listFooter: {
    height: 100
  }
});

export default StringSearchScreen;
