import React, { useEffect, useState } from "react";
import { DocumentGroup } from "../../models/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../models/server/Documents";
import { DocumentProcessor } from "../../scripts/documents/documentProcessor";
import { DocumentServer } from "../../scripts/documents/documentServer";
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
import ConfirmationModal from "../../components/ConfirmationModal";
import LanguageSelectBar from "./LanguageSelectBar";

interface ComponentProps {
}

const DownloadDocumentsScreen: React.FC<ComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverGroups, setServerGroups] = useState<Array<ServerDocumentGroup>>([]);
  const [localGroups, setLocalGroups] = useState<Array<DocumentGroup>>([]);
  const [requestDownloadForGroup, setRequestDownloadForGroup] = useState<ServerDocumentGroup | undefined>(undefined);
  const [requestDeleteForGroup, setRequestDeleteForGroup] = useState<DocumentGroup | undefined>(undefined);
  const [requestDeleteAll, setRequestDeleteAll] = useState(false);
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

  const isPopupOpen = () => requestDeleteAll || requestDeleteForGroup !== undefined || requestDownloadForGroup !== undefined;

  const onDocumentGroupPress = (group: ServerDocumentGroup) => {
    if (isLoading || isPopupOpen()) {
      return;
    }

    setRequestDownloadForGroup(group);
  };

  const onLocalDocumentGroupPress = (group: DocumentGroup) => {
    if (isLoading || isPopupOpen()) {
      return;
    }

    setRequestDeleteForGroup(group);
  };

  const onDeleteAllPress = () => {
    if (isLoading || isPopupOpen()) {
      return;
    }

    setRequestDeleteAll(true);
  };

  const onConfirmDownloadDocumentGroup = () => {
    const serverDocumentGroup = requestDownloadForGroup;
    setRequestDownloadForGroup(undefined);

    if (isLoading || serverDocumentGroup === undefined) {
      return;
    }

    downloadDocumentGroup(serverDocumentGroup);
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

  const onConfirmDeleteDocumentGroup = () => {
    const group = requestDeleteForGroup;
    setRequestDeleteForGroup(undefined);

    if (isLoading || group === undefined) {
      return;
    }

    deleteDocumentGroup(group);
  };

  const deleteDocumentGroup = (group: DocumentGroup) => {
    setIsLoading(true);

    const result = DocumentProcessor.deleteDocumentGroup(group);
    result.alert();
    result.throwIfException();

    loadLocalDocumentGroups();
  };

  const isGroupLocal = (group: ServerDocumentGroup) => {
    return localGroups.some(it => it.name == group.name);
  };

  const onConfirmDeleteAll = () => {
    setRequestDeleteAll(false);
    setIsLoading(true);
    setLocalGroups([]);

    DocumentProcessor.deleteDocumentDatabase()
      .then(result => {
        result.alert();
        result.throwIfException();
      })
      .finally(() => {
        setIsLoading(false);
        loadLocalDocumentGroups();
      });
  };

  const getAllLanguagesFromGroups = (groups: Array<ServerDocumentGroup>) => {
    const languages = DocumentProcessor.getAllLanguagesFromDocumentGroups(groups);

    if (languages.length > 0 && filterLanguage === "") {
      setFilterLanguage(languages[0]);
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

      <ConfirmationModal isOpen={requestDeleteForGroup !== undefined}
                         onClose={() => setRequestDeleteForGroup(undefined)}
                         onConfirm={onConfirmDeleteDocumentGroup}
                         message={`Delete all documents for ${requestDeleteForGroup?.name}?`} />

      <ConfirmationModal isOpen={requestDeleteAll}
                         onClose={() => setRequestDeleteAll(false)}
                         onConfirm={onConfirmDeleteAll}
                         message={`Delete ALL documents?`} />

      <Text style={styles.informationText}>Select documents to download or delete:</Text>

      <LanguageSelectBar languages={getAllLanguagesFromGroups(serverGroups)}
                         selectedLanguage={filterLanguage}
                         onLanguageClick={setFilterLanguage} />

      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl onRefresh={fetchDocumentGroups}
                                        refreshing={isLoading} />}>

        {localGroups.map((group: DocumentGroup) =>
          <LocalDocumentGroupItem key={group.name}
                               group={group}
                               onPress={onLocalDocumentGroupPress} />)}

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

      <TouchableHighlight style={styles.deleteAllButton}
                          onPress={onDeleteAllPress}>
        <Text style={styles.deleteAllButtonText}>Delete all</Text>
      </TouchableHighlight>
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
  },

  deleteAllButton: {
    padding: 10,
    margin: 25,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#e00",
    borderColor: "#b00",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3
  },
  deleteAllButtonText: {
    color: "#fff",
    fontSize: 16
  }
});
