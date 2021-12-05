import React from "react";
import { DocumentGroup } from "../../models/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../models/server/Documents";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ServerDocumentGroupItemComponentProps {
  group: ServerDocumentGroup;
  onPress: (group: ServerDocumentGroup) => void;
}

export const ServerDocumentGroupItem: React.FC<ServerDocumentGroupItemComponentProps>
  = ({
       group,
       onPress
     }) => {
  const styles = createStyles(useTheme());
  return (
    <TouchableOpacity onPress={() => onPress(group)}
                      style={styles.documentGroupItemContainer}>
      <Text style={styles.documentGroupItemText}>
        {group.name}
      </Text>
      <View style={styles.documentGroupItemInfoContainer}>
        {group.language === undefined || group.language === "" ? undefined :
          <Text style={styles.documentGroupItemInfoText}>
            {group.language}
          </Text>
        }
        {group.size === undefined ? undefined :
          <Text style={styles.documentGroupItemInfoText}>
            {group.size} documents
          </Text>
        }
      </View>
      <Icon name={"cloud-download-alt"}
            size={styles.documentGroupItemIcon.fontSize}
            color={styles.documentGroupItemIconDownload.color} />
    </TouchableOpacity>
  );
};

interface LocalDocumentGroupItemComponentProps {
  group: DocumentGroup;
  onPress: (group: DocumentGroup) => void;
}

export const LocalDocumentGroupItem: React.FC<LocalDocumentGroupItemComponentProps>
  = ({
       group,
       onPress
     }) => {
  const styles = createStyles(useTheme());
  return (
    <TouchableOpacity onPress={() => onPress(group)}
                      style={styles.documentGroupItemContainer}>
      <Text style={styles.documentGroupItemText}>
        {group.name}
      </Text>
      <View style={styles.documentGroupItemInfoContainer}>
        {group.language === undefined || group.language === "" ? undefined :
          <Text style={styles.documentGroupItemInfoText}>
            {group.language}
          </Text>
        }
        <Text style={styles.documentGroupItemInfoText}>
          {group.size} documents
        </Text>
      </View>
      <Icon name={"check"}
            size={styles.documentGroupItemIcon.fontSize}
            color={styles.documentGroupItemIconLocal.color} />
    </TouchableOpacity>
  );
};


const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  documentGroupItemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.surface1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  documentGroupItemText: {
    fontSize: 17,
    flexGrow: 1,
    color: colors.text
  },
  documentGroupItemInfoContainer: {
    paddingRight: 20,
    alignItems: "flex-end"
  },
  documentGroupItemInfoText: {
    fontSize: 13,
    color: colors.textLighter
  },
  documentGroupItemIcon: {
    fontSize: 18
  },
  documentGroupItemIconDownload: {
    color: "dodgerblue"
  },
  documentGroupItemIconLocal: {
    color: "#0d0"
  }
});
