import React from "react";
import { DocumentGroup } from "../../../models/Documents";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";


interface ScreenProps {
  group: DocumentGroup
  onPress?: (group: DocumentGroup) => void,
}

const DocumentGroupItem: React.FC<ScreenProps> = ({ group, onPress }) => {
  const styles = createStyles(useTheme());

  return (<TouchableOpacity onPress={() => onPress?.(group)} style={styles.searchListItem}>
    <Icon name={"folder-open"} style={styles.searchListItemIcon} />
    <Text style={styles.itemName}>{group.name}</Text>

    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>
        {group.size} files
      </Text>
    </View>
  </TouchableOpacity>);
};

export default DocumentGroupItem;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  searchListItem: {
    marginBottom: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  itemName: {
    padding: 15,
    fontSize: 20,
    flex: 1,
    color: colors.text
  },
  searchListItemIcon: {
    paddingLeft: 15,
    fontSize: 20,
    color: colors.text
  },
  infoContainer: {
    paddingRight: 20,
    alignItems: "flex-end"
  },
  infoText: {
    fontSize: 13,
    color: colors.textLighter
  }
});
