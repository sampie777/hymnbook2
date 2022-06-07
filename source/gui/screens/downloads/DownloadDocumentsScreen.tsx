import React, { useEffect, useState } from "react";
import { DocumentGroup as LocalDocumentGroup } from "../../../logic/db/models/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../../logic/server/models/Documents";
import { DocumentProcessor } from "../../../logic/documents/documentProcessor";
import { DocumentServer } from "../../../logic/documents/documentServer";
import { dateFrom } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import { LocalDocumentGroupItem, ServerDocumentGroupItem } from "./documentGroupItems";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import LanguageSelectBar from "./LanguageSelectBar";

interface ComponentProps {
}

const DownloadDocumentsScreen: React.FC<ComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverGroups, setServerGroups] = useState<Array<ServerDocumentGroup>>([]);
  const [localGroups, setLocalGroups] = useState<Array<LocalDocumentGroup>>([]);
  const [requestDownloadForGroup, setRequestDownloadForGroup] = useState<ServerDocumentGroup | undefined>(undefined);
  const [requestUpdateForGroup, setRequestUpdateForGroup] = useState<ServerDocumentGroup | undefined>(undefined);
  const [requestDeleteForGroup, setRequestDeleteForGroup] = useState<LocalDocumentGroup | undefined>(undefined);
  const [filterLanguage, setFilterLanguage] = useState("");
  const styles = createStyles(useTheme());

  useEffect(() => {
    onOpen();
    return onClose;
  }, []);

  const onOpen = () => {
    loadLocalDocumentGroups();
    fetchDocumentGroups();
  };

  const onClose = () => {
  };

  const loadLocalDocumentGroups = () => {
    setIsLoading(true);

    const result = DocumentProcessor.loadLocalDocumentRoot();
    result.alert();
    result.throwIfException();

    if (result.data !== undefined) {
      setLocalGroups(result.data);
      setFilterLanguage(DocumentProcessor.determineDefaultFilterLanguage(result.data));
    } else {
      setLocalGroups([]);
      setFilterLanguage("");
    }
    setIsLoading(false);
  };

  const fetchDocumentGroups = () => {
    setIsLoading(true);
    DocumentServer.fetchDocumentGroups()
      .then(result => setServerGroups(result.data))
      .catch(error => Alert.alert("Error", `Could not fetch documents. \n${error}`))
      .finally(() => setIsLoading(false));
  };

  const isPopupOpen = () => requestDeleteForGroup !== undefined || requestDownloadForGroup !== undefined;

  const onDocumentGroupPress = (group: ServerDocumentGroup) => {
    if (isLoading || isPopupOpen()) {
      return;
    }

    setRequestDownloadForGroup(group);
  };

  const onLocalDocumentGroupPress = (group: LocalDocumentGroup) => {
    if (isLoading || isPopupOpen()) {
      return;
    }

    if (hasUpdate(group)) {
      const serverGroup = serverGroups.find(it => it.name == group.name);
      if (serverGroup !== undefined) {
        return setRequestUpdateForGroup(serverGroup);
      }
    }

    setRequestDeleteForGroup(group);
  };

  const onConfirmDownloadDocumentGroup = () => {
    const serverDocumentGroup = requestDownloadForGroup;
    setRequestDownloadForGroup(undefined);

    if (isLoading || serverDocumentGroup === undefined) {
      return;
    }

    downloadDocumentGroup(serverDocumentGroup);
  };

  const onConfirmUpdateDocumentGroup = () => {
    const group = requestUpdateForGroup;
    setRequestUpdateForGroup(undefined);

    if (isLoading || group === undefined) {
      return;
    }

    updateDocumentGroup(group);
  };

  const downloadDocumentGroup = (group: ServerDocumentGroup) => {
    setIsLoading(true);

    DocumentServer.fetchDocumentGroupWithChildrenAndContent(group)
      .then(result => saveDocumentGroup(result.data))
      .catch(error =>
        Alert.alert("Error", `Error downloading documents for ${group.name}: ${error}`))
      .finally(() => setIsLoading(false));
  };

  const saveDocumentGroup = (group: ServerDocumentGroup) => {
    setIsLoading(true);

    const result = DocumentProcessor.saveDocumentGroupToDatabase(group);
    result.alert();
    result.throwIfException();

    setIsLoading(false);
    loadLocalDocumentGroups();
  };

  const updateDocumentGroup = (group: ServerDocumentGroup) => {
    setIsLoading(true);

    DocumentProcessor.fetchAndUpdateDocumentGroup(group)
      .then(result => {
        result.alert();
        result.throwIfException();
      })
      .catch(error =>
        Alert.alert("Error", `Error updating documents ${group.name}: ${error}`))
      .finally(() => {
        setLocalGroups([]);
        setIsLoading(false);
        loadLocalDocumentGroups();
      });
  };

  const onConfirmDeleteDocumentGroup = () => {
    const group = requestDeleteForGroup;
    setRequestDeleteForGroup(undefined);

    if (isLoading || group === undefined) {
      return;
    }

    deleteDocumentGroup(group);
  };

  const deleteDocumentGroup = (group: LocalDocumentGroup) => {
    setIsLoading(true);

    const result = DocumentProcessor.deleteDocumentGroup(group);
    result.alert();
    result.throwIfException();

    loadLocalDocumentGroups();
  };

  const isGroupLocal = (group: ServerDocumentGroup) => {
    return localGroups.some(it => it.name == group.name);
  };

  const hasUpdate = (localGroup: LocalDocumentGroup) => {
    const serverGroup = serverGroups.find(it => it.name == localGroup.name);
    if (serverGroup === undefined) {
      return false;
    }

    const serverDate = dateFrom(serverGroup.modifiedAt);
    const localDate = localGroup.modifiedAt;
    return serverDate > localDate;
  };

  const getAllLanguagesFromGroups = (groups: Array<ServerDocumentGroup>) => {
    const languages = DocumentProcessor.getAllLanguagesFromDocumentGroups(groups);

    if (languages.length > 0 && filterLanguage === "") {
      if (languages.includes("AF")) {
        setFilterLanguage("AF");
      } else {
        setFilterLanguage(languages[0]);
      }
    }

    return languages;
  };

  return (
    <View style={styles.container}>
      <ConfirmationModal isOpen={requestDownloadForGroup !== undefined}
                         onClose={() => setRequestDownloadForGroup(undefined)}
                         onConfirm={onConfirmDownloadDocumentGroup}
                         invertConfirmColor={true}
                         message={`Download documents for ${requestDownloadForGroup?.name}?`} />

      <ConfirmationModal isOpen={requestUpdateForGroup !== undefined}
                         onClose={() => setRequestUpdateForGroup(undefined)}
                         onConfirm={onConfirmUpdateDocumentGroup}
                         invertConfirmColor={true}
                         message={`Update ${requestUpdateForGroup?.name}?`} />

      <ConfirmationModal isOpen={requestDeleteForGroup !== undefined}
                         onClose={() => setRequestDeleteForGroup(undefined)}
                         onConfirm={onConfirmDeleteDocumentGroup}
                         message={`Delete all documents for ${requestDeleteForGroup?.name}?`} />

      <Text style={styles.informationText}>Select documents to download or delete:</Text>

      <LanguageSelectBar languages={getAllLanguagesFromGroups(serverGroups)}
                         selectedLanguage={filterLanguage}
                         onLanguageClick={setFilterLanguage} />

      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl onRefresh={fetchDocumentGroups}
                                        refreshing={isLoading} />}>

        {localGroups.map((group: LocalDocumentGroup) =>
          <LocalDocumentGroupItem key={group.name}
                                  group={group}
                                  onPress={onLocalDocumentGroupPress}
                                  hasUpdate={hasUpdate(group)} />)}

        {serverGroups.filter(it => !isGroupLocal(it))
          .filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase())
          .map((group: ServerDocumentGroup) =>
            <ServerDocumentGroupItem key={group.name}
                                     group={group}
                                     onPress={onDocumentGroupPress} />)}

        {serverGroups.length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            {isLoading ? "Loading..." : "No online data available..."}
          </Text>
        }
        {isLoading || serverGroups.length === 0 || serverGroups.filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase()).length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            No documents found for language "{filterLanguage}"...
          </Text>
        }
      </ScrollView>
    </View>
  );
};

export default DownloadDocumentsScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.background
  },

  informationText: {
    fontSize: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    color: colors.text
  },

  listContainer: {},

  emptyListText: {
    padding: 20,
    textAlign: "center",
    color: colors.text
  }
});
