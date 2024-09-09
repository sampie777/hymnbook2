import React from "react";
import { DocumentGroup as LocalDocumentGroup } from "../../../logic/db/models/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../../logic/server/models/Documents";
import { languageAbbreviationToFullName } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DownloadIcon, IsDownloadedIcon, IsDownloadingIcon, UpdateIcon } from "./common";
import { useUpdaterContext } from "../../components/providers/UpdaterContextProvider";

interface ServerDocumentGroupItemComponentProps {
  group: ServerDocumentGroup;
  onPress: (group: ServerDocumentGroup) => void;
  onLongPress?: (group: ServerDocumentGroup) => void;
  disabled: boolean;
}

export const ServerDocumentGroupItem: React.FC<ServerDocumentGroupItemComponentProps>
  = ({
       group,
       onPress,
       onLongPress,
       disabled
     }) => {
  const styles = createStyles(useTheme());
  const { documentGroupsUpdating } = useUpdaterContext();
  const isUpdating = documentGroupsUpdating.some(it => it.uuid === group.uuid);

  return (
    <TouchableOpacity onPress={() => onPress(group)}
                      onLongPress={() => onLongPress?.(group)}
                      style={styles.container}
                      disabled={disabled}>
      <Text style={styles.titleText}
            importantForAccessibility={"auto"}>
        {group.name}
      </Text>
      <View style={styles.infoContainer}>
        {group.language === undefined || group.language === "" ? undefined :
          <Text style={styles.infoText}
                importantForAccessibility={"auto"}>
            {languageAbbreviationToFullName(group.language)}
          </Text>
        }
        {group.size === undefined ? undefined :
          <Text style={styles.infoText}
                importantForAccessibility={"no"}>
            {group.size} documents
          </Text>
        }
      </View>
      <View>
        {isUpdating ? <IsDownloadingIcon /> : <DownloadIcon />}
      </View>
    </TouchableOpacity>
  );
};

interface LocalDocumentGroupItemComponentProps {
  group: LocalDocumentGroup;
  onPress: (group: LocalDocumentGroup) => void;
  onLongPress?: (group: LocalDocumentGroup) => void;
  hasUpdate?: boolean;
  disabled: boolean;
}

export const LocalDocumentGroupItem: React.FC<LocalDocumentGroupItemComponentProps>
  = ({
       group,
       onPress,
       onLongPress,
       hasUpdate = false,
       disabled
     }) => {
  const styles = createStyles(useTheme());
  const { documentGroupsUpdating } = useUpdaterContext();
  const isUpdating = documentGroupsUpdating.some(it => it.uuid === group.uuid);

  return (
    <TouchableOpacity onPress={() => onPress(group)}
                      onLongPress={() => onLongPress?.(group)}
                      style={styles.container}
                      disabled={disabled}>
      <Text style={styles.titleText}
            importantForAccessibility={"auto"}>
        {group.name}
      </Text>
      <View style={styles.infoContainer}>
        {group.language === undefined || group.language === "" ? undefined :
          <Text style={styles.infoText}
                importantForAccessibility={"auto"}>
            {languageAbbreviationToFullName(group.language)}
          </Text>
        }
        <Text style={styles.infoText}
              importantForAccessibility={"no"}>
          {group.size} documents
        </Text>
      </View>
      <View>
        {isUpdating ? <IsDownloadingIcon /> :
          (!hasUpdate ? <IsDownloadedIcon /> : <UpdateIcon />)}
      </View>
    </TouchableOpacity>
  );
};


const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingRight: 20,
    paddingVertical: 14,
    borderColor: colors.border.default,
    borderBottomWidth: 1,
    backgroundColor: colors.surface1,
    flexDirection: "row",
    alignItems: "center"
  },
  titleText: {
    paddingLeft: 20,
    fontSize: 17,
    flex: 1,
    color: colors.text.default
  },
  infoContainer: {
    paddingRight: 20,
    paddingLeft: 5,
    alignItems: "flex-end"
  },
  infoText: {
    fontSize: 13,
    color: colors.text.lighter
  }
});
