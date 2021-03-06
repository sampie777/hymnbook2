import React, { useEffect, useState } from "react";
import { DocumentGroup as LocalDocumentGroup } from "../../../logic/db/models/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../../logic/server/models/Documents";
import { DocumentProcessor } from "../../../logic/documents/documentProcessor";
import { DocumentServer } from "../../../logic/documents/documentServer";
import { languageAbbreviationToFullName } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { LocalDocumentGroupItem, ServerDocumentGroupItem } from "./documentGroupItems";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import LanguageSelectBar from "./LanguageSelectBar";

interface ComponentProps {
  setIsProcessing?: (value: boolean) => void;
}

const DownloadDocumentsScreen: React.FC<ComponentProps> = ({ setIsProcessing }) => {
  let isMounted = true;
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
    isMounted = true;
    loadLocalDocumentGroups();
    fetchDocumentGroups();
  };

  const onClose = () => {
    isMounted = false;
  };

  useEffect(() => {
    if (!isMounted) return;

    // Let user navigate when the screen is still loading the data
    if (serverGroups.length === 0) {
      return;
    }
    setIsProcessing?.(isLoading);
  }, [isLoading]);

  const loadLocalDocumentGroups = () => {
    setIsLoading(true);

    const result = DocumentProcessor.loadLocalDocumentRoot();
    result.alert();
    result.throwIfException();

    if (!isMounted) return;

    if (result.data !== undefined) {
      setLocalGroups(result.data);
    } else {
      setLocalGroups([]);
    }

    if (filterLanguage === "") {
      if (result.data !== undefined) {
        setFilterLanguage(DocumentProcessor.determineDefaultFilterLanguage(result.data));
      } else {
        setFilterLanguage("");
      }
    }

    setIsLoading(false);
  };

  const fetchDocumentGroups = () => {
    setIsLoading(true);
    DocumentServer.fetchDocumentGroups()
      .then(result => {
        if (!isMounted) return;
        setServerGroups(result.data);
      })
      .catch(error => Alert.alert("Error", `Could not fetch documents. \n${error}`))
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
  };

  const applyUuidUpdateForPullRequest8 = () => {
    DocumentProcessor.updateLocalGroupsWithUuid(localGroups, serverGroups);
  };
  useEffect(applyUuidUpdateForPullRequest8, [serverGroups]);

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

    if (DocumentProcessor.hasUpdate(serverGroups, group)) {
      const serverGroup = DocumentProcessor.getMatchingServerGroup(serverGroups, group);
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
      .then(result => {
        if (!isMounted) return;
        saveDocumentGroup(result.data);
      })
      .catch(error =>
        Alert.alert("Error", `Error downloading ${group.name}: ${error}`))
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
  };

  const saveDocumentGroup = (group: ServerDocumentGroup) => {
    setIsLoading(true);

    const result = DocumentProcessor.saveDocumentGroupToDatabase(group);
    result.alert();
    result.throwIfException();

    if (!isMounted) return;

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
        Alert.alert("Error", `Error updating ${group.name}: ${error}`))
      .finally(() => {
        if (!isMounted) return;
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

    if (!isMounted) return;

    loadLocalDocumentGroups();
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
                         onLanguageClick={setFilterLanguage}
                         disabled={isLoading} />

      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl onRefresh={fetchDocumentGroups}
                                        tintColor={styles.refreshControl.color}
                                        refreshing={isLoading} />}>

        {localGroups.map((group: LocalDocumentGroup) =>
          <LocalDocumentGroupItem key={group.uuid + group.name}
                                  group={group}
                                  onPress={onLocalDocumentGroupPress}
                                  hasUpdate={DocumentProcessor.hasUpdate(serverGroups, group)}
                                  disabled={isLoading} />)}

        {serverGroups.filter(it => !DocumentProcessor.isGroupLocal(localGroups, it))
          .filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase())
          .map((group: ServerDocumentGroup) =>
            <ServerDocumentGroupItem key={group.uuid + group.name}
                                     group={group}
                                     onPress={onDocumentGroupPress}
                                     disabled={isLoading} />)}

        {serverGroups.length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            {isLoading ? "Loading..." : "No online data available..."}
          </Text>
        }
        {isLoading || serverGroups.length === 0 || serverGroups.filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase()).length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            No documents found for language "{languageAbbreviationToFullName(filterLanguage)}"...
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
    paddingTop: 15,
    paddingBottom: 3,
    color: colors.text
  },

  listContainer: {},

  emptyListText: {
    padding: 20,
    textAlign: "center",
    color: colors.text
  },

  refreshControl: {
    color: colors.textLighter
  }
});
