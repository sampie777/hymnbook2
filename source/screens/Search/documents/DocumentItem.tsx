import React from "react";
import { Document } from "../../../models/Documents";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
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
    ]}>
      {document.name}
    </Text>

    {searchText === undefined || searchText.length === 0 ? undefined :
      <Text style={styles.parentName}>
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
    borderColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 8,
  },

  parentName: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.textLighter,
    fontFamily: "sans-serif-light",
    fontStyle: "italic"
  },

  itemName: {
    paddingTop: 2,
    paddingHorizontal: 15,
    fontSize: 20,
    flex: 1,
    color: colors.text
  },
  itemExtraPadding: {
    paddingTop: 5,
    paddingBottom: 7
  }
});
