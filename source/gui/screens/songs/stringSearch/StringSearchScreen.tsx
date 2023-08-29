import React, { useCallback, useEffect, useRef, useState } from "react";
import Db from "../../../../logic/db/db";
import Settings from "../../../../settings";
import { rollbar } from "../../../../logic/rollbar";
import { InterruptedError } from "../../../../logic/InterruptedError";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { debounce } from "../../../components/utils";
import { isIOS, sanitizeErrorForRollbar } from "../../../../logic/utils";
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
  const [searchInTitles, setSearchInTitles] = useState(Settings.songSearchInTitles);
  const [searchInVerses, setSearchInVerses] = useState(Settings.songSearchInVerses);
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

  useFocusEffect(useCallback(() => {
    onFocus();
    return onBlur;
  }, []));

  const onFocus = () => {
    isMounted = true;
  };

  const onBlur = () => {
    isMounted = false;
  };

  useEffect(useCallback(() => {
    if (Settings.songSearchInTitles == searchInTitles
      && Settings.songSearchInVerses == searchInVerses) {
      return;
    }

    Settings.songSearchInTitles = searchInTitles;
    Settings.songSearchInVerses = searchInVerses;
    Settings.store();
  }, [searchInTitles, searchInVerses]), [searchInTitles, searchInVerses]);

  const isSearchEmpty = (text: string) => text.length === 0 || (!searchInTitles && !searchInVerses);

  const clearSearch = () => {
    setSearchResults([]);
    setIsLoading(false);
    immediateSearchText.current = "";
  };

  useEffect(() => {
    const escapedSearchText = searchText.replace(/\\/g, "\\\\");
    immediateSearchText.current = escapedSearchText;

    if (!isMounted) return;

    if (!Db.songs.isConnected()) {
      return;
    }

    if (isSearchEmpty(escapedSearchText)) {
      clearSearch();
      return;
    }

    setIsLoading(true);
    requestAnimationFrame(() => fetchSearchResultsDebounced(escapedSearchText));
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
    } catch (error) {
      if (error instanceof InterruptedError) return;

      rollbar.error("Failed to fetch search results from song database", {
        ...sanitizeErrorForRollbar(error),
        searchText: text,
        immediateSearchText: immediateSearchText.current,
        searchInTitles: searchInTitles,
        searchInVerses: searchInVerses,
        isMounted: isMounted,
        dbIsConnected: Db.songs.isConnected(),
        dbIsClosed: Db.songs.realm().isClosed
      });
    }

    // Prevent state update if the new state will by invalid anyway
    if (text != immediateSearchText.current) return;
    if (!isMounted) return;

    setSearchResults(results.sort((a, b) => b.points - a.points));
    setIsLoading(false);
  };

  const fetchSearchResultsDebounced: FetchSearchResultsFunction = debounce(fetchSearchResults, 500);

  const renderContentItem = useCallback(({ item }: { item: SongSearch.SearchResult }) => {
    // Use the ref, as the state will cause unnecessary updates
    const searchRegex = SongSearch.makeSearchTextRegexable(immediateSearchText.current);

    // Validate regex syntax
    try {
      RegExp(searchRegex);
    } catch (error) {
      // Invalid regex
      rollbar.warning("Failed to create safe regex for song search", {
        ...sanitizeErrorForRollbar(error),
        searchText: searchText,
        immediateSearchText: immediateSearchText.current,
        searchRegex: searchRegex
      });
      return null;
    }

    return <SearchResultComponent navigation={navigation}
                                  searchRegex={searchRegex}
                                  showSongBundle={false}
                                  disable={isLoading}
                                  song={item.song}
                                  isTitleMatch={item.isTitleMatch}
                                  isMetadataMatch={item.isMetadataMatch}
                                  isVerseMatch={item.isVerseMatch} />;
  }, [isLoading]);

  return <View style={styles.container}>
    <SearchInput value={searchText}
                 onChange={setSearchText}
                 autoFocus={true} />
    <SearchOptions isTitleActive={searchInTitles}
                   isVerseActive={searchInVerses}
                   onTitlePress={() => setSearchInTitles(!searchInTitles)}
                   onVersePress={() => setSearchInVerses(!searchInVerses)} />

    <FlatList style={styles.listContainer}
              onRefresh={isIOS || isLoading ? () => undefined : undefined} // Hack to show loading icon only when loading and disabling pull to refresh
              refreshing={isLoading}
              progressViewOffset={15}
              data={searchResults}
              renderItem={renderContentItem}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              keyExtractor={(it: SongSearch.SearchResult) => it.song.id.toString()}
              disableScrollViewPanResponder={true}
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
    color: colors.text.lighter,
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
