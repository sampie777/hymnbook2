import React from "react";
import { Document } from "../../../../logic/db/models/Documents";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { Text, TouchableOpacity, StyleSheet } from "react-native";


interface ScreenProps {
  document: Document;
  onPress?: (document: Document) => void;
  searchText?: string;
}

const DocumentItem: React.FC<ScreenProps> = ({ document, onPress, searchText }) => {
  const styles = createStyles(useTheme());

  return (<TouchableOpacity onPress={() => onPress?.(document)}
                            style={styles.container}>
    <Text style={[
      styles.itemName,
      (!(searchText === undefined || searchText.length === 0) ? {} : styles.itemExtraPadding)
    ]}
          importantForAccessibility={"auto"}>
      {document.name}
    </Text>

    {searchText === undefined || searchText.length === 0 ? undefined :
      <Text style={styles.parentName}
            importantForAccessibility={"auto"}>
        {Document.getParent(document)?.name}
      </Text>
    }
  </TouchableOpacity>);
};

export default DocumentItem;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    marginBottom: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border.default,
    borderBottomWidth: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 8
  },

  itemName: {
    paddingTop: 2,
    paddingHorizontal: 15,
    fontSize: 19,
    flex: 1,
    color: colors.text.default
  },
  itemExtraPadding: {
    paddingTop: 5,
    paddingBottom: 7
  },

  parentName: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.text.lighter,
    fontStyle: "italic"
  }
});
