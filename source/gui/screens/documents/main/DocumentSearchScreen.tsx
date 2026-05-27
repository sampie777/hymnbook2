import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { rollbar } from "../../../../logic/rollbar";
import Settings from "../../../../settings";
import Db from "../../../../logic/db/db";
import { isDbItemValid, sanitizeErrorForRollbar } from "../../../../logic/utils/utils.ts";
import { Document, DocumentGroup } from "../../../../logic/db/models/documents/Documents";
import { DocumentRoute, DocumentSearchRoute, ParamList } from "../../../../navigation";
import { DocumentSearch } from "../../../../logic/documents/documentSearch";
import { DocumentGroupSchema } from "../../../../logic/db/models/documents/DocumentsSchema";
import { getParentForDocumentGroup } from "../../../../logic/documents/utils";
import { RectangularInset, useCollectionListener } from "../../../components/utils";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { Alert, BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import HeaderIconButton from "../../../components/HeaderIconButton";
import DownloadInstructions from "./DownloadInstructions";
import SearchInput from "./search/SearchInput";
import SearchOptions from "./search/SearchOptions.tsx";
import SearchResultScreen from "./search/SearchResultScreen.tsx";
import DocumentGroupItem from "./DocumentGroupItem.tsx";
import DocumentItem from "./DocumentItem.tsx";

const DocumentSearchScreen: React.FC<NativeStackScreenProps<ParamList, typeof DocumentSearchRoute>> = ({ navigation }) => {
  const immediateSearchText = useRef(""); // Var for keeping track of search text, which can be used outside the React state scope, like the timed out database fetch function

  const [isLoading, setIsLoading] = useState(true);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [group, setGroup] = useState<DocumentSearch.DbDocumentGroup | undefined>(undefined);
  const [rootGroups, setRootGroups] = useState<Array<DocumentSearch.DbDocumentGroup>>([]);
  const [searchText, setSearchText] = useState("");
  const [searchInTitles, setSearchInTitles] = useState(Settings.documentSearchInTitles);
  const [searchInContent, setSearchInContent] = useState(Settings.documentSearchInContent);
  const [sortOrder, setSortOrder] = useState<DocumentSearch.OrderBy>(Settings.documentSearchSortOrder);

  const styles = createStyles(useTheme());

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
  };

  const onExit = () => {
    setGroup(undefined);  // Throw away these in case of live reload of the app
    setRootGroups([]);
    setShowSearchOptions(false);
  };

  useFocusEffect(useCallback(() => {
    const backHandlerSubscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => backHandlerSubscription.remove();
  }, [group, searchText]));

  useFocusEffect(useCallback(() => {
    onFocus();
    return onBlur;
  }, []));

  const onFocus = () => {
  };

  const onBlur = () => {
    setShowSearchOptions(false);

    if (Settings.documentsResetPathToRoot) {
      setGroup(undefined);
      setRootGroups([]);
      setSearchText("");
    }
    setIsLoading(true);
  };

  const onBackPress = (): boolean => {
    if (searchText.length > 0) {
      setSearchText("");
      return true;
    }

    setShowSearchOptions(false);

    if (group !== undefined) {
      previousLevel();
      return true;
    }

    return false;
  };

  useEffect(useCallback(() => {
    if (Settings.documentSearchInTitles == searchInTitles
      && Settings.documentSearchInContent == searchInContent
      && Settings.documentSearchSortOrder == sortOrder) {
      return;
    }

    Settings.documentSearchInTitles = searchInTitles;
    Settings.documentSearchInContent = searchInContent;
    Settings.documentSearchSortOrder = sortOrder;
    Settings.store();
  }, [searchInTitles, searchInContent, sortOrder]), [searchInTitles, searchInContent, sortOrder]);

  useCollectionListener<DocumentGroup>(Db.documents.realm().objects(DocumentGroupSchema.name), () => {
    try {
      const groups = Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name)
        .filtered(`isRoot = true`);
      setRootGroups(Array.from(groups));
    } catch (error) {
      rollbar.error("Failed to load document root groups from database.", sanitizeErrorForRollbar(error));
    }
    setIsLoading(false);
  });

  const previousLevel = () => {
    if (searchText.length > 0) {
      setSearchText("")
      return;
    }

    setShowSearchOptions(false);

    if (group === undefined) {
      return;
    }

    const parent = getParentForDocumentGroup(group);
    setGroup(parent || undefined);
    setSearchText("");
  };

  const checkIfItemIsStillValid = (item: Document | DocumentGroup) => {
    if (!isDbItemValid(item)) {
      Alert.alert("Just a moment", "This document has been updated. Please re-open the screen.");
      return false;
    }
    return true;
  }

  const onGroupPress = (group: DocumentSearch.DbDocumentGroup) => {
    setShowSearchOptions(false);

    if (!checkIfItemIsStillValid(group)) return;

    setGroup(group);
    setSearchText("");
  };

  const onDocumentPress = (document: Document) => {
    if (!checkIfItemIsStillValid(document)) return;

    navigation.navigate(DocumentRoute, { id: document.id, uuid: document.uuid });
  };

  const groups = (): Array<DocumentSearch.DbDocumentGroup> => {
    if (group === undefined) {
      return rootGroups;
    }

    if (group.groups == null) {
      return [];
    }

    return Array.from(group.groups as DocumentSearch.DbDocumentGroup[]);
  };

  const items = (): Array<Document> => {
    if (group === undefined) {
      return [];
    }

    if (group.items == null) {
      return [];
    }

    return group.items;
  };

  const hasInvalidObjects = (): boolean => {
    if (rootGroups.length > 0 && rootGroups.some(it => !it.isValid())) {
      rollbar.debug("Some root groups are invalid");
      setGroup(undefined);
      setRootGroups([]);
      return true;
    } else if (group && !group.isValid()) {
      // We know this one will occur very often, so we don't want to log it. We just want to know about the others
      // rollbar.debug("The selected group is invalid")
      setGroup(undefined);
      return true;
    } else if (group && (group.groups as DocumentSearch.DbDocumentGroup[]).some(it => !it.isValid())) {
      rollbar.debug("Some sub groups are invalid");
      setGroup(undefined);
      return true;
    }
    return false;
  };

  if (hasInvalidObjects()) {
    return <View style={styles.container}>
      <Text style={styles.pageTitle}>Please reload this screen</Text>
    </View>;
  }

  return (<View style={styles.container}>
    <View style={styles.pageHeader}>
      {group === undefined && searchText.length == 0 ? undefined :
        <HeaderIconButton onPress={previousLevel}
                          icon={"arrow-left"}
                          hitSlop={RectangularInset(10)}
                          accessibilityLabel={"Back"} />}

      <Text style={styles.pageTitle}>
        {searchText.length > 0 ? "Search" : group?.name || "Browse"}
      </Text>
    </View>

    <View style={styles.searchForm}>
      <SearchInput value={searchText}
                   onChange={setSearchText}
                   onFocus={() => setShowSearchOptions(true)} />
      {showSearchOptions &&
        <SearchOptions isTitleActive={searchInTitles}
                       onTitlePress={() => setSearchInTitles(!searchInTitles)}
                       isContentActive={searchInContent}
                       onContentPress={() => setSearchInContent(!searchInContent)}
                       sortOrder={sortOrder}
                       onSortOrderChange={setSortOrder} />}
    </View>

    {isLoading || rootGroups.length > 0 ? undefined : <DownloadInstructions navigation={navigation} />}

    {searchText.length > 0
      ? <SearchResultScreen searchText={searchText}
                            immediateSearchText={immediateSearchText}
                            selectedGroupUuids={group ? [group.uuid] : []}
                            onGroupPress={onGroupPress}
                            onDocumentPress={onDocumentPress}
                            searchInTitles={searchInTitles}
                            searchInContent={searchInContent}
                            sortOrder={sortOrder} />
      :
      <ScrollView keyboardShouldPersistTaps={"handled"}>
        {groups()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(it => <DocumentGroupItem
            key={it.id}
            group={it}
            onPress={onGroupPress} />)
        }

        {items()
          .map(it => it as Document)
          .sort((a, b) => a.name.localeCompare(b.name))
          .sort((a, b) => a.index - b.index)
          .map(it => <DocumentItem key={it.id}
                                   document={it}
                                   onPress={onDocumentPress} />)}
      </ScrollView>
    }
  </View>);
};

export default DocumentSearchScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    backgroundColor: colors.background
  },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
  },

  pageTitle: {
    flex: 1,
    fontSize: 20,
    color: colors.text.default,
    paddingHorizontal: 15,
    paddingVertical: 15
  },

  searchForm: {
    marginBottom: 15,
  },
});

