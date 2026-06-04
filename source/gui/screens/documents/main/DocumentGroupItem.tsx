import React from "react";
import { DocumentGroup } from "../../../../logic/db/models/documents/Documents";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { isDbItemValid } from "../../../../logic/utils/utils.ts";
import SafeText from "../../../components/SafeText.tsx";


interface ScreenProps<T extends DocumentGroup> {
  group: T;
  onPress?: (group: T) => void;
  disabled?: boolean;
  showDocumentGroup?: boolean;
}

const DocumentGroupItem: React.FC<ScreenProps<DocumentGroup & Realm.Object<DocumentGroup>>> = ({
                                                                                                 group,
                                                                                                 onPress,
                                                                                                 disabled = false,
                                                                                                 showDocumentGroup = false,
                                                                                               }) => {
  if (!isDbItemValid(group)) return null;

  const styles = createStyles(useTheme());

  const parentName = !showDocumentGroup ? undefined : DocumentGroup.getParent(group)?.name;

  return (<TouchableOpacity onPress={() => onPress?.(group)}
                            disabled={disabled}
                            style={styles.container}>
    <Icon name={"folder"} style={styles.searchListItemIcon} />
    <View style={styles.nameContainer}>
      <SafeText style={[
        styles.itemName,
        (!parentName && styles.itemExtraPadding)
      ]}
            importantForAccessibility={"auto"}>
        {group.name}
      </SafeText>

      {parentName &&
        <View style={styles.documentGroupContainer}>
          <SafeText style={styles.parentName}>
            <Icon name={"book"} />
          </SafeText>
          <SafeText style={styles.parentName} importantForAccessibility={'auto'}>
            {parentName}
          </SafeText>
        </View>
      }
    </View>

    <View style={styles.infoContainer}>
      <SafeText style={styles.infoText}
            importantForAccessibility={"no"}>
        {group.size} files
      </SafeText>
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
    fontSize: 14,
    color: colors.text.lighter,
    fontStyle: "italic"
  },

  documentGroupContainer: {
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
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
  },

  textHighlighted: {
    color: colors.text.highlighted.foreground,
    backgroundColor: colors.text.highlighted.background
  }
});
