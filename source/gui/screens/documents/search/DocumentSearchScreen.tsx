import React, { useCallback, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { rollbar } from "../../../../logic/rollbar";
import Settings from "../../../../settings";
import Db from "../../../../logic/db/db";
import { sanitizeErrorForRollbar } from "../../../../logic/utils";
import { Document, DocumentGroup } from "../../../../logic/db/models/documents/Documents";
import { DocumentRoute, DocumentSearchRoute, ParamList } from "../../../../navigation";
import { DocumentSearch } from "../../../../logic/documents/documentSearch";
import { DocumentGroupSchema } from "../../../../logic/db/models/documents/DocumentsSchema";
import { getParentForDocumentGroup } from "../../../../logic/documents/utils";
import { RectangularInset, useCollectionListener } from "../../../components/utils";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import HeaderIconButton from "../../../components/HeaderIconButton";
import DocumentItem from "./DocumentItem";
import DocumentGroupItem from "./DocumentGroupItem";
import DownloadInstructions from "./DownloadInstructions";
import SearchInput from "./SearchInput";


const DocumentSearchScreen: React.FC<NativeStackScreenProps<ParamList, typeof DocumentSearchRoute>> = ({ navigation }) => {
  type DbDocumentGroup = DocumentGroup & Realm.Object<DocumentGroup>;

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<DbDocumentGroup | undefined>(undefined);
  const [rootGroups, setRootGroups] = useState<Array<DbDocumentGroup>>([]);
  const [searchText, setSearchText] = useState("");
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
  };

  useFocusEffect(useCallback(() => {
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [group, searchText]));

  useFocusEffect(useCallback(() => {
    onFocus();
    return onBlur;
  }, []));

  const onFocus = () => {
  };

  const onBlur = () => {
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

    if (group !== undefined) {
      previousLevel();
      return true;
    }

    return false;
  };

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
    if (group === undefined) {
      return;
    }

    const parent = getParentForDocumentGroup(group);
    setGroup(parent || undefined);
    setSearchText("");
  };

  const onGroupPress = (group: DbDocumentGroup) => {
    setGroup(group);
    setSearchText("");
  };

  const onDocumentPress = (document: Document) => {
    navigation.navigate(DocumentRoute, { id: document.id, uuid: document.uuid });
  };

  const groups = (): Array<DbDocumentGroup> => {
    if (group === undefined) {
      return rootGroups;
    }

    if (group.groups == null) {
      return [];
    }

    return Array.from(group.groups as DbDocumentGroup[]);
  };

  const groupsForSearch = () => {
    if (group === undefined) {
      return DocumentSearch.searchForGroups(groups(), searchText);
    }
    return DocumentSearch.searchForGroups([group], searchText);
  };

  const groupsWithSearchResult = (): Array<DbDocumentGroup> => {
    if (searchText.length > 0) {
      return groupsForSearch() as DbDocumentGroup[];
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
    } else if (group && (group.groups as DbDocumentGroup[]).some(it => !it.isValid())) {
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
      {group === undefined ? undefined :
        <HeaderIconButton onPress={previousLevel}
                          icon={"arrow-left"}
                          hitSlop={RectangularInset(10)}
                          accessibilityLabel={"Back"} />}

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

      {items()
        .map(it => it as Document)
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
    color: colors.text.default,
    paddingHorizontal: 15,
    paddingVertical: 15
  }
});

