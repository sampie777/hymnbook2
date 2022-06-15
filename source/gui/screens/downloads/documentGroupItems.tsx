import React from "react";
import { DocumentGroup as LocalDocumentGroup } from "../../../logic/db/models/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../../logic/server/models/Documents";
import { languageAbbreviationToFullName } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DownloadIcon, IsDownloadedIcon, UpdateIcon } from "./common";

interface ServerDocumentGroupItemComponentProps {
  group: ServerDocumentGroup;
  onPress: (group: ServerDocumentGroup) => void;
  disabled: boolean;
}

export const ServerDocumentGroupItem: React.FC<ServerDocumentGroupItemComponentProps>
  = ({
       group,
       onPress,
       disabled
     }) => {
  const styles = createStyles(useTheme());
  return (
    <TouchableOpacity onPress={() => onPress(group)}
                      style={styles.container}
                      disabled={disabled}>
      <Text style={styles.titleText}>
        {group.name}
      </Text>
      <View style={styles.infoContainer}>
        {group.language === undefined || group.language === "" ? undefined :
          <Text style={styles.infoText}>
            {languageAbbreviationToFullName(group.language)}
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
  disabled: boolean;
}

export const LocalDocumentGroupItem: React.FC<LocalDocumentGroupItemComponentProps>
  = ({
       group,
       onPress,
       hasUpdate = false,
       disabled
     }) => {
  const styles = createStyles(useTheme());
  return (
    <TouchableOpacity onPress={() => onPress(group)}
                      style={styles.container}
                      disabled={disabled}>
      <Text style={styles.titleText}>
        {group.name}
      </Text>
      <View style={styles.infoContainer}>
        {group.language === undefined || group.language === "" ? undefined :
          <Text style={styles.infoText}>
            {languageAbbreviationToFullName(group.language)}
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
    paddingRight: 20,
    paddingVertical: 14,
    borderColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.surface1,
    flexDirection: "row",
    alignItems: "center"
  },
  titleText: {
    paddingLeft: 20,
    fontSize: 17,
    flex: 1,
    color: colors.text
  },
  infoContainer: {
    paddingRight: 20,
    paddingLeft: 5,
    alignItems: "flex-end"
  },
  infoText: {
    fontSize: 13,
    color: colors.textLighter
  }
});
