import React, { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { isDbItemValid, isIOS, sanitizeErrorForRollbar } from "../../../../../logic/utils/utils.ts";
import { DocumentSearch } from "../../../../../logic/documents/documentSearch.ts";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider.tsx";
import { SongSearch } from "../../../../../logic/songs/songSearch.ts";
import { rollbar } from "../../../../../logic/rollbar.ts";
import { isTitleSimilarToOtherDocumentGroups } from "../../../../../logic/documents/utils.ts";
import { debounce, useIsMounted } from "../../../../components/utils.ts";
import Db from "../../../../../logic/db/db.tsx";
import { InterruptedError } from "../../../../../logic/InterruptedError.ts";
import DocumentGroupItem from "../DocumentGroupItem.tsx";
import DocumentItem from "../DocumentItem.tsx";
import { Document } from "../../../../../logic/db/models/documents/Documents.ts";
import SafeText from "../../../../components/SafeText.tsx";

type FetchSearchResultsFunction = (text: string) => void;

interface Props {
  searchText: string
  immediateSearchText: RefObject<string>
  selectedGroupUuids: string[]
  onGroupPress: (group: DocumentSearch.DbDocumentGroup) => void
  onDocumentPress: (document: Document) => void
  searchInTitles: boolean
  searchInContent: boolean
  sortOrder: DocumentSearch.OrderBy
}

const SearchResultScreen: React.FC<Props> = ({
                                               searchText,
                                               immediateSearchText,
                                               selectedGroupUuids,
                                               onGroupPress,
                                               searchInTitles,
                                               searchInContent,
                                               sortOrder,
                                               onDocumentPress,
                                             }) => {
  const isMounted = useIsMounted();
  const [searchResults, setSearchResults] = useState<DocumentSearch.SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const styles = createStyles(useTheme());

  useEffect(() => {
    if (searchText.length == 0) return;

    setSearchResults(DocumentSearch.sort([...searchResults], sortOrder));
  }, [sortOrder]);

  const isSearchEmpty = (text: string) => text.length === 0 || (!searchInTitles && !searchInContent);

  const clearSearch = () => {
    setSearchResults([]);
    setIsLoading(false);
    immediateSearchText.current = "";
  };

  useEffect(() => {
    const escapedSearchText = searchText.replace(/\\/g, "\\\\");
    immediateSearchText.current = escapedSearchText;

    if (!isMounted()) return;

    if (!Db.documents.isConnected()) {
      return;
    }

    if (isSearchEmpty(escapedSearchText)) {
      clearSearch();
      return;
    }

    setIsLoading(true);
    requestAnimationFrame(() => fetchSearchResultsDebounced(escapedSearchText));
  }, [searchText, searchInTitles, searchInContent, selectedGroupUuids]);

  const fetchSearchResults: FetchSearchResultsFunction = (text: string) => {
    if (!isMounted()) return;

    if (isSearchEmpty(immediateSearchText.current) || isSearchEmpty(text)) {
      clearSearch();
      return;
    }

    let results: Array<DocumentSearch.SearchResult> = [];
    try {
      // Include all sub groups in our search
      const groupAndSubGroupScopeUuids = DocumentSearch.getGroupAndSubGroupScopeUuids(selectedGroupUuids);

      results = DocumentSearch.find(text,
        searchInTitles,
        searchInContent,
        groupAndSubGroupScopeUuids,
        () => text != immediateSearchText.current || isSearchEmpty(immediateSearchText.current)
      );
    } catch (error) {
      if (error instanceof InterruptedError) return;

      rollbar.error("Failed to fetch search results from document database", {
        ...sanitizeErrorForRollbar(error),
        searchText: text,
        immediateSearchText: immediateSearchText.current,
        searchInTitles: searchInTitles,
        searchInContent: searchInContent,
        sortOrder: sortOrder,
        isMounted: isMounted(),
        dbIsConnected: Db.songs.isConnected(),
        dbIsClosed: Db.songs.realm().isClosed
      });
    }

    // Prevent state update if the new state will be invalid anyway
    if (text != immediateSearchText.current) return;
    if (!isMounted()) return;

    setSearchResults(DocumentSearch.sort(results, sortOrder));
    setIsLoading(false);
  };

  const fetchSearchResultsDebounced: FetchSearchResultsFunction = debounce(fetchSearchResults, searchInContent ? 750 : 0);

  const allGroups = useMemo(() => {
    return searchResults
      .filter(it => isDbItemValid(it.group))
      .map(it => it.group!);
  }, [searchResults]);

  const renderContentItem = useCallback(({ item }: { item: DocumentSearch.SearchResult }) => {
    if (!isDbItemValid(item.document ?? item.group)) return null;

    // Use the ref, as the state will cause unnecessary updates
    const searchRegex = SongSearch.makeSearchTextRegexable(immediateSearchText.current);

    // Validate regex syntax
    try {
      RegExp(searchRegex);
    } catch (error) {
      // Invalid regex
      rollbar.warning("Failed to create safe regex for document search", {
        ...sanitizeErrorForRollbar(error),
        searchText: searchText,
        immediateSearchText: immediateSearchText.current,
        searchRegex: searchRegex
      });
      return null;
    }

    if (item.group != undefined) {
      const showDocumentGroup =
        selectedGroupUuids.length == 1 ? false :
          selectedGroupUuids.length > 3 && searchText.length == 0 ? true
            : isTitleSimilarToOtherDocumentGroups(item.group, allGroups);

      return <DocumentGroupItem showDocumentGroup={showDocumentGroup}
                                disabled={isLoading}
                                group={item.group!}
                                onPress={() => onGroupPress(item.group!)} />
    }

    const showDocumentGroup = !selectedGroupUuids.includes(Document.getParent(item.document)?.uuid ?? "")
      || !(item.document == undefined || selectedGroupUuids.length == 1);
    return <DocumentItem document={item.document!}
                         searchRegex={searchRegex}
                         disabled={isLoading}
                         isContentMatch={item.isContentMatch}
                         showDocumentGroup={showDocumentGroup}
                         onPress={() => onDocumentPress(item.document!)}
    />
  }, [isLoading]);

  return <>
    <FlatList style={styles.listContainer}
              onRefresh={(searchInContent && (isIOS || isLoading)) ? () => undefined : undefined} // Hack to show loading icon only when loading and disabling pull to refresh. Don't show it for only searching in titles, as that is fast enough
              refreshing={isLoading}
              progressViewOffset={15}
              data={isLoading ? [] : searchResults}
              renderItem={renderContentItem}
              initialNumToRender={10}
              maxToRenderPerBatch={searchText.length > 0 ? 10 : 30} // Use 10 for a regex search because it's slower
              keyExtractor={(it: DocumentSearch.SearchResult) => isDbItemValid(it.document ?? it.group) ? (it.document ?? it.group)!.uuid : `invalidated_${Math.random() * 10000}`}
              disableScrollViewPanResponder={true}
              ListHeaderComponent={
                <SafeText style={styles.resultsInfoText}>
                  {isLoading ? "Searching..." :
                    <>{searchResults.length === 0 ? "No" : searchResults.length} results</>
                  }
                </SafeText>
              }
              ListFooterComponent={<View style={styles.listFooter} />} />
  </>
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  resultsInfoText: {
    color: colors.text.lighter,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 15,
    fontSize: 13
  },
  listFooter: {
    height: 100
  },
});

export default SearchResultScreen;
