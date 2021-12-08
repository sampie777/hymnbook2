import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CollectionChangeCallback } from "realm";
import Db from "../../../scripts/db/db";
import { DocumentGroup, Document } from "../../../models/Documents";
import { DocumentRouteParams, routes } from "../../../navigation";
import { DocumentGroupSchema } from "../../../models/DocumentsSchema";
import { getParentForDocumentGroup } from "../../../scripts/documents/utils";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { ScrollView, View, Text, StyleSheet, BackHandler } from "react-native";
import HeaderIconButton from "../../../components/HeaderIconButton";
import DocumentItem from "./DocumentItem";
import DocumentGroupItem from "./DocumentGroupItem";
import DownloadInstructions from "./DownloadInstructions";


interface ScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const DocumentSearchScreen: React.FC<ScreenProps> = ({ navigation }) => {
  let isMounted = true;
  const [group, setGroup] = useState<DocumentGroup | undefined>(undefined);
  const [rootGroups, setRootGroups] = useState<Array<DocumentGroup>>([]);
  const styles = createStyles(useTheme());

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
    isMounted = true;
    Db.documents.realm().objects(DocumentGroupSchema.name).addListener(onCollectionChange)
  };

  const onExit = () => {
    // This is needed, as the removeListener doesn't seem to correctly work.
    isMounted = false;
    Db.documents.realm().objects(DocumentGroupSchema.name).removeListener(onCollectionChange)
  };

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [group])
  );

  const onBackPress = (): boolean => {
    if (group === undefined) {
      return false;
    }

    previousLevel();
    return true;
  };

  const onCollectionChange: CollectionChangeCallback<Object> = () => {
    if (!isMounted) {
      return;
    }
    reloadRootGroups();
  }

  const reloadRootGroups = () => {
    const groups = Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name)
      .filtered(`isRoot = true`)
      .map(it => it as unknown as DocumentGroup);
    setRootGroups(groups);
  };

  const previousLevel = () => {
    if (group === undefined) {
      return;
    }

    const parent = getParentForDocumentGroup(group);
    setGroup(parent || undefined);
  };

  const onGroupPress = (group: DocumentGroup) => {
    setGroup(group);
  };

  const onDocumentPress = (document: Document) => {
    navigation.navigate(routes.Document, { id: document.id } as DocumentRouteParams);
  };

  return (<View style={styles.container}>

    {rootGroups.length === 0 ? undefined :
      <View style={styles.pageHeader}>
        {group === undefined ? undefined :
          <HeaderIconButton onPress={previousLevel} icon={"arrow-left"} />}

        <Text style={styles.pageTitle}>
          {group?.name || "Browse"}
        </Text>
      </View>
    }

    {rootGroups.length > 0 ? undefined : <DownloadInstructions navigation={navigation} />}

    <ScrollView>
      {group !== undefined ? undefined :
        rootGroups
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(it => <DocumentGroupItem key={it.id} group={it} onPress={onGroupPress} />)}

      {group === undefined ? undefined :
        group.groups
          ?.map(it => it as DocumentGroup)
          .sort((a, b) => a.name.localeCompare(b.name))
          ?.map(it => <DocumentGroupItem key={it.id} group={it} onPress={onGroupPress} />)}

      {group === undefined ? undefined :
        group.items
          ?.map(it => it as Document)
          ?.sort((a, b) => a.index - b.index)
          ?.map(it => <DocumentItem key={it.id} document={it} onPress={onDocumentPress} />)}
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

