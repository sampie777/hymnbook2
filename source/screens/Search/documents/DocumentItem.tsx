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
    {searchText === undefined || searchText.length === 0 ? undefined :
      <Text style={styles.parentName}>
        {Document.getParent(document)?.name}
      </Text>
    }
    <Text style={[
      styles.itemName,
      (!(searchText === undefined || searchText.length === 0) ? {} : styles.itemExtraPadding)
    ]}>
      {document.name}
    </Text>
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
    alignItems: "flex-start"
  },

  parentName: {
    paddingTop: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.textLighter,
    fontFamily: "sans-serif-light",
    fontStyle: "italic"
  },

  itemName: {
    paddingBottom: 15,
    paddingHorizontal: 15,
    fontSize: 20,
    flex: 1,
    color: colors.text
  },
  itemExtraPadding: {
    padding: 15
  }
});
