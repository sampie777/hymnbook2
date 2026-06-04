import React, { memo, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider.tsx";
import { isDbItemValid } from "../../../../../logic/utils/utils.ts";
import { DocumentGroup } from "../../../../../logic/db/models/documents/Documents.ts";
import { renderTextWithCustomReplacements } from "../../../../components/utils.ts";
import SafeText from "../../../../components/SafeText.tsx";

interface Props {
  group: DocumentGroup & Realm.Object<DocumentGroup>;
  searchRegex: string;
  showDocumentGroup?: boolean;
  disable?: boolean;
  onPress?: () => void;
}

const DocumentGroupSearchResultComponent: React.FC<Props> = memo(({
                                                                    group,
                                                                    searchRegex,
                                                                    showDocumentGroup,
                                                                    disable = false,
                                                                    onPress,
                                                                  }) => {
  const styles = createStyles(useTheme());
  if (!isDbItemValid(group)) return null;

  const createHighlightedTextComponent = useCallback((text: string, index: number) =>
    <SafeText key={index} style={styles.textHighlighted}>
      {text}
    </SafeText>, [searchRegex]);

  return <TouchableOpacity style={[styles.container, (disable ? styles.containerDisabled : {})]}
                           onPress={disable ? undefined : onPress}>
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <SafeText style={styles.documentName}
              importantForAccessibility={"auto"}>
          {renderTextWithCustomReplacements(group.name, searchRegex, createHighlightedTextComponent)}
        </SafeText>

        {!showDocumentGroup ? null :
          <View style={styles.documentGroupContainer}>
            <SafeText style={styles.extraInfoText}>
              <Icon name={"book"} />
            </SafeText>
            <SafeText style={styles.extraInfoText}>
              {DocumentGroup.getParent(group)?.name}
            </SafeText>
          </View>
        }
      </View>
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

export default DocumentGroupSearchResultComponent;
