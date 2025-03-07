import React, { useEffect, useState } from 'react';
import { Alert, SectionList, StyleSheet, Text, View } from 'react-native';
import { ThemeContextProps, useTheme, } from '../../../components/providers/ThemeProvider';
import { DocumentHistory } from '../../../../logic/db/models/documents/DocumentHistory';
import { DocumentHistorySchema } from '../../../../logic/db/models/documents/DocumentHistorySchema';
import { DocumentHistoryRoute, DocumentRoute, ParamList } from '../../../../navigation';
import Db from '../../../../logic/db/db';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadDocumentWithUuidOrId } from "../../../../logic/documents/utils";
import DocumentItemBaseComponent from "../search/DocumentItemBaseComponent";

type DocumentHistoryGroupedItem = {
  documentTitle: string;
  documentUuid: string;
  path: string;
  timestamp: Date;
};

type Section = {
  title: string;
  data: DocumentHistoryGroupedItem[];
};

const DocumentHistoryScreen: React.FC<
  NativeStackScreenProps<ParamList, typeof DocumentHistoryRoute>
> = ({ navigation }) => {
  const styles = createStyles(useTheme());
  const [groupedItems, setGroupedItems] = useState<Section[]>([]);

  // Mostly generated by CoPilot
  useEffect(() => {
    const documentHistoryEntries = Db.documents
      .realm()
      .objects<DocumentHistory>(DocumentHistorySchema.name)
      .sorted('timestamp', true);

    // Step 1: Group by document
    const groupedByDocument = documentHistoryEntries.reduce(
      (acc: DocumentHistory[][], item: DocumentHistory) => {
        if (acc.length == 0) acc.push([]);
        if (
          acc[acc.length - 1].length > 0 &&
          acc[acc.length - 1][0].documentUuid != item.documentUuid
        ) {
          acc.push([]);
        }
        acc[acc.length - 1].push(item);
        return acc;
      },
      [],
    );

    // Step 2: Generate document titles
    const documentItems: DocumentHistoryGroupedItem[] = Object.values(groupedByDocument).map(items => {
      const documentTitle = items[0].documentName
      return {
        documentTitle,
        documentUuid: items[0].documentUuid,
        path: items[0].path,
        timestamp: items[0].timestamp,
      };
    });

    // Step 3: Group by time periods
    const now = new Date();
    const groupedByTime = documentItems.reduce((acc: Section[], item) => {
      const itemDate = new Date(item.timestamp);
      let title = '';

      const lastWeekDate = new Date(now);
      lastWeekDate.setDate(now.getDate() - 7);
      lastWeekDate.setHours(0);
      lastWeekDate.setMinutes(0);
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(now.getMonth() - 1);
      lastMonthDate.setHours(0);
      lastMonthDate.setMinutes(0);

      if (itemDate.toDateString() === now.toDateString()) {
        title = 'Today';
      } else if (itemDate > lastWeekDate) {
        title = 'In the last week';
      } else if (itemDate > lastMonthDate) {
        title = 'In the last month';
      } else {
        title = 'Older';
      }

      const lastGroup = acc[acc.length - 1];
      if (lastGroup && lastGroup.title === title) {
        lastGroup.data.push(item);
      } else {
        acc.push({
          title: title,
          data: [item],
        });
      }

      return acc;
    }, []);

    groupedByTime.forEach(it => {
      it.title += ` (${it.data.length})`;
    });

    setGroupedItems(groupedByTime);
  }, []);

  const navigateToDocument = (uuid: string) => {
    // First check if document exists in the database
    const document = loadDocumentWithUuidOrId(uuid);
    if (document == undefined) {
      Alert.alert(
        'Not found',
        "This document isn't available. Have you download the corresponding document group? Or maybe it has been deleted.",
      );
      return;
    }

    navigation.navigate(DocumentRoute, { uuid: uuid });
  };

  const renderItem = ({ item }: { item: DocumentHistoryGroupedItem }) => (
    <DocumentItemBaseComponent
      documentName={item.documentTitle}
      parentName={item.path}
      onPress={() => navigateToDocument(item.documentUuid)}
    />
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedItems}
        renderItem={({ item }) => renderItem({ item })}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.timestamp.toString()}
      />
    </View>
  );
};

export default DocumentHistoryScreen;

const createStyles = ({ colors, fontFamily }: ThemeContextProps) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      padding: 10,
      marginTop: 50,
      backgroundColor: colors.background,
    },
    headerText: {
      fontSize: 20,
      color: colors.text.default,
      fontFamily: fontFamily.sansSerif,
      textAlign: 'center',
    },
  });
