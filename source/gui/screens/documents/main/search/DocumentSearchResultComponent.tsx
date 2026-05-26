import React, { memo, useCallback } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { DocumentRoute, ParamList } from "../../../../../navigation.tsx";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider.tsx";
import { isDbItemValid } from "../../../../../logic/utils/utils.ts";
import { Document } from "../../../../../logic/db/models/documents/Documents.ts";
import { renderTextWithCustomReplacements } from "../../../../components/utils.ts";
import DocumentSummary from "./DocumentSummary.tsx";
import MatchedDocumentSummary from "./MatchedDocumentSummary.tsx";

interface Props {
  navigation: NativeStackNavigationProp<ParamList, any>;
  document: Document & Realm.Object<Document>;
  searchRegex: string;
  showDocumentGroup?: boolean;
  disable?: boolean;
  isTitleMatch?: boolean;
  isContentMatch?: boolean;
}

const DocumentSearchResultComponent: React.FC<Props> = memo(({
                                                       navigation,
                                                       document,
                                                       searchRegex,
                                                       showDocumentGroup,
                                                       disable = false,
                                                       isTitleMatch = false,
                                                       isContentMatch = false
                                                     }) => {
  const styles = createStyles(useTheme());
  if (!isDbItemValid(document)) return null;

  const checkIfDocumentIsStillValid = () => {
    if (!isDbItemValid(document)) {
      Alert.alert("Just a moment", "This document has been updated. Please reload the search results.");
      return false;
    }
    return true;
  }

  const onPress = () => {
    if (!checkIfDocumentIsStillValid()) return;

    navigation.navigate(DocumentRoute, {
      id: document.id,
      uuid: document.uuid,
      highlightText: isContentMatch ? searchRegex : undefined,
    });
  };

  const createHighlightedTextComponent = useCallback((text: string, index: number) =>
    <Text key={index} style={styles.textHighlighted}>
      {text}
    </Text>, [searchRegex]);

  return <TouchableOpacity style={[styles.container, (disable ? styles.containerDisabled : {})]}
                           onPress={disable ? undefined : onPress}>
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.documentName}
              importantForAccessibility={"auto"}>
          {!isTitleMatch ? document.name :
            renderTextWithCustomReplacements(document.name, searchRegex, createHighlightedTextComponent)
          }
        </Text>

        {!showDocumentGroup ? null :
          <View style={styles.documentGroupContainer}>
            <Text style={styles.extraInfoText}>
              <Icon name={"book"} />
            </Text>
            <Text style={styles.extraInfoText}>
              {Document.getParent(document)?.name}
            </Text>
          </View>
        }
      </View>
    </View>

    <View style={styles.contentContainer}>
      {isContentMatch
        ? <MatchedDocumentSummary document={document}
                                  searchRegex={searchRegex} />
        : <DocumentSummary document={document}
                           maxLines={2}
                           searchText={undefined} />
      }
    </View>
  </TouchableOpacity>;
});

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderColor: colors.border.default,
    paddingHorizontal: 10,
    backgroundColor: colors.surface1,
    marginBottom: 5
  },
  containerDisabled: {
    opacity: 0.4
  },

  headerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 4
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 25,
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 2,
  },

  documentName: {
    fontSize: 18,
    color: colors.text.default
  },

  extraInfoText: {
    fontSize: 14,
    color: colors.text.lighter,
    fontStyle: "italic"
  },

  documentGroupContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  alternativeTitle: {
    paddingHorizontal: 15,
  },

  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    justifyContent: "flex-start"
  },

  textHighlighted: {
    color: colors.text.highlighted.foreground,
    backgroundColor: colors.text.highlighted.background
  }
});

export default DocumentSearchResultComponent;
