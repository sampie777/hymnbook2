import React from "react";
import { DocumentGroup } from "../../../../logic/db/models/Documents";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";


interface ScreenProps<T extends DocumentGroup> {
  group: T;
  onPress?: (group: T) => void;
  searchText?: string;
}

const DocumentGroupItem: React.FC<ScreenProps<DocumentGroup & Realm.Object<DocumentGroup>>> = ({ group, onPress, searchText }) => {
  const styles = createStyles(useTheme());

  return (<TouchableOpacity onPress={() => onPress?.(group)} style={styles.container}>
    <Icon name={"folder"} style={styles.searchListItemIcon} />
    <View style={styles.nameContainer}>
      <Text style={[
        styles.itemName,
        (!(searchText === undefined || searchText.length === 0) ? {} : styles.itemExtraPadding)
      ]}
            importantForAccessibility={"auto"}>
        {group.name}
      </Text>

      {searchText === undefined || searchText.length === 0 ? undefined :
        <Text style={styles.parentName}
              importantForAccessibility={"auto"}>
          {DocumentGroup.getParent(group)?.name}
        </Text>
      }
    </View>

    <View style={styles.infoContainer}>
      <Text style={styles.infoText}
            importantForAccessibility={"no"}>
        {group.size} files
      </Text>
    </View>
  </TouchableOpacity>);
};

export default DocumentGroupItem;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    marginBottom: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border.default,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },

  nameContainer: {
    paddingVertical: 8,
    flex: 1
  },
  itemName: {
    paddingHorizontal: 15,
    fontSize: 19,
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
  },

  searchListItemIcon: {
    paddingLeft: 15,
    fontSize: 20,
    color: colors.text.default
  },
  infoContainer: {
    paddingRight: 20,
    alignItems: "flex-end"
  },
  infoText: {
    fontSize: 13,
    color: colors.text.lighter
  }
});
