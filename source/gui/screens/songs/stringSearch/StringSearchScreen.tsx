import React, { useCallback, useEffect, useRef, useState } from "react";
import Db from "../../../../logic/db/db";
import { rollbar } from "../../../../logic/rollbar";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { debounce } from "../../../components/utils";
import { InterruptedError } from "../../../../logic/utils";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamList, SongStringSearchRoute } from "../../../../navigation";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { FlatList, StyleSheet, Text, View } from "react-native";
import SearchInput from "../../documents/search/SearchInput";
import SearchOptions from "./SearchOptions";
import SearchResultComponent from "./SearchResultComponent";

interface Props {
  navigation: NativeStackNavigationProp<ParamList, typeof SongStringSearchRoute>;
}

type FetchSearchResultsFunction = (text: string) => void;

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

  const isSearchEmpty = (text: string) => text.length === 0 || (!searchInTitles && !searchInVerses);

  const clearSearch = () => {
    setSearchResults([]);
    setIsLoading(false);
    immediateSearchText.current = "";
  };

  useEffect(() => {
    immediateSearchText.current = searchText;

    if (!isMounted) return;

    if (!Db.songs.isConnected()) {
      return;
    }

    if (isSearchEmpty(searchText)) {
      clearSearch();
      return;
    }

    setIsLoading(true);
    requestAnimationFrame(() => fetchSearchResultsDebounced(searchText));
  }, [searchText, searchInTitles, searchInVerses]);

  const fetchSearchResults: FetchSearchResultsFunction = (text: string) => {
    if (!isMounted) return;

    if (isSearchEmpty(immediateSearchText.current)) {
      clearSearch();
      return;
    }

    let results: Array<SongSearch.SearchResult> = [];
    try {
      results = SongSearch.find(text, searchInTitles, searchInVerses,
        () => text != immediateSearchText.current || isSearchEmpty(immediateSearchText.current)
      );
    } catch (e: any) {
      if (e instanceof InterruptedError) return;

      rollbar.error("Failed to fetch search results from song database", {
        error: e,
        errorName: e.name,
        searchText: text,
        immediateSearchText: immediateSearchText.current,
        searchInTitles: searchInTitles,
        searchInVerses: searchInVerses,
        isMounted: isMounted
      });
    }

    // Prevent state update if the new state will by invalid anyway
    if (text != immediateSearchText.current) return;
    if (!isMounted) return;

    setSearchResults(results);
    setIsLoading(false);
  };

  const fetchSearchResultsDebounced: FetchSearchResultsFunction = debounce(fetchSearchResults, 300);

  const renderContentItem = useCallback(({ item }: { item: SongSearch.SearchResult }) => {
    return <SearchResultComponent navigation={navigation}
                                  searchText={immediateSearchText.current}  // Use the ref, as the state will cause unnecessary updates
                                  showSongBundle={false}
                                  disable={isLoading}
                                  song={item.song}
                                  isTitleMatch={item.isTitleMatch}
                                  isVerseMatch={item.isVerseMatch} />;
  }, []);

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
              progressViewOffset={15}
              data={searchResults.sort((a, b) => b.points - a.points)}
              renderItem={renderContentItem}
              initialNumToRender={25}
              maxToRenderPerBatch={10}
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
