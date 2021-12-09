import React from "react";
import { DocumentGroup as LocalDocumentGroup} from "../../models/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../models/server/Documents";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DownloadIcon, IsDownloadedIcon, UpdateIcon } from "./common";

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
                      style={styles.container}>
      <Text style={styles.titleText}>
        {group.name}
      </Text>
      <View style={styles.infoContainer}>
        {group.language === undefined || group.language === "" ? undefined :
          <Text style={styles.infoText}>
            {group.language}
          </Text>
        }
        {group.size === undefined ? undefined :
          <Text style={styles.infoText}>
            {group.size} documents
          </Text>
        }
      </View>
      <DownloadIcon />
    </TouchableOpacity>
  );
};

interface LocalDocumentGroupItemComponentProps {
  group: LocalDocumentGroup;
  onPress: (group: LocalDocumentGroup) => void;
  hasUpdate?: boolean;
}

export const LocalDocumentGroupItem: React.FC<LocalDocumentGroupItemComponentProps>
  = ({
       group,
       onPress,
       hasUpdate = false,
     }) => {
  const styles = createStyles(useTheme());
  return (
    <TouchableOpacity onPress={() => onPress(group)}
                      style={styles.container}>
      <Text style={styles.titleText}>
        {group.name}
      </Text>
      <View style={styles.infoContainer}>
        {group.language === undefined || group.language === "" ? undefined :
          <Text style={styles.infoText}>
            {group.language}
          </Text>
        }
        <Text style={styles.infoText}>
          {group.size} documents
        </Text>
      </View>
      <View>
        {!hasUpdate ? <IsDownloadedIcon /> : <UpdateIcon />}
      </View>
    </TouchableOpacity>
  );
};


const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.surface1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  titleText: {
    fontSize: 17,
    flexGrow: 1,
    color: colors.text
  },
  infoContainer: {
    paddingRight: 20,
    alignItems: "flex-end"
  },
  infoText: {
    fontSize: 13,
    color: colors.textLighter
  },
});
