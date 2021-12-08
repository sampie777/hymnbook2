import React from "react";
import { Document } from "../../../models/Documents";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { Text, TouchableOpacity, StyleSheet } from "react-native";


interface ScreenProps {
  document: Document
  onPress?: (document: Document) => void,
}

const DocumentItem: React.FC<ScreenProps> = ({ document, onPress }) => {
  const styles = createStyles(useTheme());

  return (<TouchableOpacity onPress={() => onPress?.(document)} style={styles.searchListItem}>
    <Text style={styles.searchListItemText}>{document.name}</Text>
  </TouchableOpacity>);
};

export default DocumentItem;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  searchListItem: {
    marginBottom: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  searchListItemText: {
    padding: 15,
    fontSize: 20,
    flex: 1,
    color: colors.text
  },
});
