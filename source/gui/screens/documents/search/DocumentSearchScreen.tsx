import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { CollectionChangeCallback } from "realm";
import { rollbar } from "../../../../logic/rollbar";
import Db from "../../../../logic/db/db";
import { runAsync } from "../../../../logic/utils";
import { DocumentGroup, Document } from "../../../../logic/db/models/Documents";
import { DocumentRoute, DocumentSearchRoute, ParamList } from "../../../../navigation";
import { DocumentSearch } from "../../../../logic/documents/documentSearch";
import { DocumentGroupSchema } from "../../../../logic/db/models/DocumentsSchema";
import { getParentForDocumentGroup } from "../../../../logic/documents/utils";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { ScrollView, View, Text, StyleSheet, BackHandler } from "react-native";
import HeaderIconButton from "../../../components/HeaderIconButton";
import DocumentItem from "./DocumentItem";
import DocumentGroupItem from "./DocumentGroupItem";
import DownloadInstructions from "./DownloadInstructions";
import SearchInput from "./SearchInput";


const DocumentSearchScreen: React.FC<NativeStackScreenProps<ParamList, typeof DocumentSearchRoute>> = ({ navigation }) => {
  let isMounted = true;
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<DocumentGroup | undefined>(undefined);
  const [rootGroups, setRootGroups] = useState<Array<DocumentGroup>>([]);
  const [searchText, setSearchText] = useState("");
  const styles = createStyles(useTheme());

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
    isMounted = true;
  };

  const onExit = () => {
    // This is needed, as the removeListener doesn't seem to correctly work.
    isMounted = false;
    setGroup(undefined);  // Throw away these in case of live reload of the app
    setRootGroups([]);
  };

  useFocusEffect(React.useCallback(() => {
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [group, searchText]));

  useFocusEffect(React.useCallback(() => {
    onFocus();
    return onBlur;
  }, []));

  const onFocus = () => {
    isMounted = true;
    Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name).addListener(onCollectionChange);
  };

  const onBlur = () => {
    isMounted = false;
    Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name).removeListener(onCollectionChange);
    setGroup(undefined);
    setRootGroups([]);
    setSearchText("");
    setIsLoading(true);
  };

  const onBackPress = (): boolean => {
    if (searchText.length > 0) {
      setSearchText("");
      return true;
    }

    if (group !== undefined) {
      previousLevel();
      return true;
    }

    return false;
  };

  const onCollectionChange: CollectionChangeCallback<DocumentGroup> = () => {
    if (!isMounted) {
      return;
    }
    runAsync(reloadRootGroups);
  };

  const reloadRootGroups = () => {
    try {
      const groups = Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name)
        .filtered(`isRoot = true`);
      setRootGroups(Array.from(groups));
    } catch (e: any) {
      rollbar.error("Failed to load document root groups from database: " + e, e);
    }
    setIsLoading(false);
  };

  const previousLevel = () => {
    if (group === undefined) {
      return;
    }

    const parent = getParentForDocumentGroup(group);
    setGroup(parent || undefined);
    setSearchText("");
  };

  const onGroupPress = (group: DocumentGroup) => {
    setGroup(group);
    setSearchText("");
  };

  const onDocumentPress = (document: Document) => {
    navigation.navigate(DocumentRoute, { id: document.id });
  };

  const groups = (): Array<DocumentGroup> => {
    if (group === undefined) {
      return rootGroups;
    }

    if (group.groups == null) {
      return [];
    }

    return Array.from(group.groups);
  };

  const groupsForSearch = () => {
    if (group === undefined) {
      return DocumentSearch.searchForGroups(groups(), searchText);
    }
    return DocumentSearch.searchForGroups([group], searchText);
  };

  const groupsWithSearchResult = (): Array<DocumentGroup> => {
    if (searchText.length > 0) {
      return groupsForSearch();
    }
    return groups();
  };

  const items = (): Array<Document> => {
    if (searchText.length > 0) {
      return itemsForSearch();
    }

    if (group === undefined) {
      return [];
    }

    if (group.items == null) {
      return [];
    }

    return group.items;
  };

  const itemsForSearch = () => {
    if (group === undefined) {
      return DocumentSearch.searchForItems(groups(), searchText);
    }
    return DocumentSearch.searchForItems([group], searchText);
  };

  return (<View style={styles.container}>
    <View style={styles.pageHeader}>
      {group === undefined ? undefined :
        <HeaderIconButton onPress={previousLevel} icon={"arrow-left"} />}

      <Text style={styles.pageTitle}>
        {group?.name || "Browse"}
      </Text>
    </View>

    <SearchInput value={searchText} onChange={setSearchText} />

    {isLoading || rootGroups.length > 0 ? undefined : <DownloadInstructions navigation={navigation} />}

    <ScrollView keyboardShouldPersistTaps={"handled"}>
      {groupsWithSearchResult()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(it => <DocumentGroupItem
          key={it.id}
          group={it}
          searchText={searchText}
          onPress={onGroupPress} />)
      }

      {items().map(it => it as Document)
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => a.index - b.index)
        .map(it => <DocumentItem key={it.id}
                                 document={it}
                                 searchText={searchText}
                                 onPress={onDocumentPress} />)}
    </ScrollView>
  </View>);
};

export default DocumentSearchScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "stretch",
    backgroundColor: colors.background
  },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10
  },

  pageTitle: {
    flex: 1,
    fontSize: 20,
    color: colors.text,
    paddingHorizontal: 15,
    paddingVertical: 15
  }
});

