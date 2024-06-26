import React, { useEffect, useState } from "react";
import { DocumentGroup as LocalDocumentGroup } from "../../../logic/db/models/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../../logic/server/models/Documents";
import { DocumentProcessor } from "../../../logic/documents/documentProcessor";
import { DocumentServer } from "../../../logic/documents/documentServer";
import { DeepLinking } from "../../../logic/deeplinking";
import { rollbar } from "../../../logic/rollbar";
import { languageAbbreviationToFullName, sanitizeErrorForRollbar } from "../../../logic/utils";
import { itemCountPerLanguage } from "./common";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { useIsMounted } from "../../components/utils";
import {
  Alert,
  RefreshControl,
  ScrollView, Share,
  StyleSheet,
  Text,
  View
} from "react-native";
import { LocalDocumentGroupItem, ServerDocumentGroupItem } from "./documentGroupItems";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import LanguageSelectBar, { ShowAllLanguagesValue } from "./LanguageSelectBar";

interface ComponentProps {
  setIsProcessing?: (value: boolean) => void;
  promptForUuid?: string;
  dismissPromptForUuid?: () => void;
}

const DownloadDocumentsScreen: React.FC<ComponentProps> = ({
                                                             setIsProcessing,
                                                             promptForUuid,
                                                             dismissPromptForUuid
                                                           }) => {
  const isMounted = useIsMounted();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocalGroupsLoading, setIsLocalGroupsLoading] = useState(true);
  const [isGroupLoading, setIsGroupLoading] = useState(false);
  const [serverGroups, setServerGroups] = useState<ServerDocumentGroup[]>([]);
  const [localGroups, setLocalGroups] = useState<(LocalDocumentGroup & Realm.Object<LocalDocumentGroup>)[]>([]);
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

  useEffect(() => {
    if (!isMounted()) return;

    // Let user navigate when the screen is still loading the data
    if (serverGroups.length === 0) {
      return;
    }
    setIsProcessing?.(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (isLocalGroupsLoading) return;
    loadAndPromptSpecificGroup();
  }, [promptForUuid, isLocalGroupsLoading]);

  const loadAndPromptSpecificGroup = () => {
    if (!promptForUuid) return;
    if (localGroups.find(it => it.uuid === promptForUuid)) return;

    setIsGroupLoading(true);
    DocumentServer.fetchDocumentGroup({ uuid: promptForUuid }, {})
      .then(data => {
        if (!isMounted()) return;

        if (localGroups.find(it => it.uuid === promptForUuid)) return;

        setFilterLanguage(data.language);
        setRequestDownloadForGroup(data);
      })
      .catch(error => {
        if (error.name == "TypeError" && error.message == "Network request failed") {
          Alert.alert("Error", "Could not load documents group. Make sure your internet connection is working or try again later.")
        } else {
          Alert.alert("Error", `Could not load documents group. \n${error}\n\nTry again later.`);
        }
      })
      .finally(() => {
        dismissPromptForUuid?.();

        if (!isMounted()) return;
        setIsGroupLoading(false);
      });
  };

  const loadLocalDocumentGroups = () => {
    setIsLoading(true);
    setIsLocalGroupsLoading(true);

    const result = DocumentProcessor.loadLocalDocumentRoot();
    result.alert();
    result.throwIfException();

    if (!isMounted()) return;

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
    setIsLocalGroupsLoading(false);
  };

  const fetchDocumentGroups = () => {
    setIsLoading(true);
    DocumentServer.fetchDocumentGroups()
      .then(data => {
        if (!isMounted()) return;
        setServerGroups(data);
      })
      .catch(error => {
        if (error.name == "TypeError" && error.message == "Network request failed") {
          Alert.alert("Error", "Could not load documents. Make sure your internet connection is working or try again later.")
        } else {
          Alert.alert("Error", `Could not load documents. \n${error}\n\nTry again later.`);
        }
      })
      .finally(() => {
        if (!isMounted()) return;
        setIsLoading(false);
      });
  };

  const applyUuidUpdateForPullRequest8 = () => {
    DocumentProcessor.updateLocalGroupsWithUuid(localGroups, serverGroups);
  };
  useEffect(applyUuidUpdateForPullRequest8, [serverGroups]);

  const isPopupOpen = () => requestDeleteForGroup !== undefined || requestDownloadForGroup !== undefined;

  const shareDocumentGroup = (it: LocalDocumentGroup | ServerDocumentGroup) => {
    return Share.share({
      message: `Download documents for ${it.name}\n\n${DeepLinking.generateLinkForDocumentGroup(it)}`
    })
      .then(r => rollbar.debug("Document group shared.", {
        shareAction: r,
        bundle: it
      }))
      .catch(error => rollbar.warning("Failed to share document group", {
        ...sanitizeErrorForRollbar(error),
        bundle: it
      }));
  };

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
      .then(data => {
        if (!isMounted()) return;
        saveDocumentGroup(data);
      })
      .catch(error => {
        if (error.name == "TypeError" && error.message == "Network request failed") {
          Alert.alert("Error", `Could not download ${group.name}. Make sure your internet connection is working or try again later.`)
        } else {
          Alert.alert("Error", `Could not download ${group.name}. \n${error}\n\nTry again later.`);
        }
      })
      .finally(() => {
        if (!isMounted()) return;
        setIsLoading(false);
      });
  };

  const saveDocumentGroup = (group: ServerDocumentGroup) => {
    setIsLoading(true);

    const result = DocumentProcessor.saveDocumentGroupToDatabase(group);
    result.alert();
    result.throwIfException();

    if (!isMounted()) return;

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
      .catch(error => {
        if (error.name == "TypeError" && error.message == "Network request failed") {
          Alert.alert("Error", `Could not update ${group.name}. Make sure your internet connection is working or try again later.`)
        } else {
          Alert.alert("Error", `Could not update ${group.name}. \n${error}\n\nTry again later.`);
        }
      })
      .finally(() => {
        if (!isMounted()) return;
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

    if (!isMounted()) return;

    loadLocalDocumentGroups();
  };

  const getAllLanguagesFromGroups = (groups: ServerDocumentGroup[]) => {
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

  const isOfSelectedLanguage = (it: { language: string }) =>
    filterLanguage === ShowAllLanguagesValue || it.language.toUpperCase() === filterLanguage.toUpperCase();

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
                         itemCountPerLanguage={itemCountPerLanguage(localGroups)} />

      <ScrollView nestedScrollEnabled={true}
                  style={styles.listContainer}
                  refreshControl={<RefreshControl onRefresh={fetchDocumentGroups}
                                                  tintColor={styles.refreshControl.color}
                                                  refreshing={isLoading || isGroupLoading} />}>

        {localGroups.filter(it => it.isValid())
          .filter(isOfSelectedLanguage)
          .map((group: LocalDocumentGroup) =>
            <LocalDocumentGroupItem key={group.uuid + group.name}
                                    group={group}
                                    onPress={onLocalDocumentGroupPress}
                                    onLongPress={shareDocumentGroup}
                                    hasUpdate={DocumentProcessor.hasUpdate(serverGroups, group)}
                                    disabled={isLoading || isGroupLoading} />)}

        {serverGroups.filter(it => !DocumentProcessor.isGroupLocal(localGroups, it))
          .filter(isOfSelectedLanguage)
          .map((group: ServerDocumentGroup) =>
            <ServerDocumentGroupItem key={group.uuid + group.name}
                                     group={group}
                                     onPress={onDocumentGroupPress}
                                     onLongPress={shareDocumentGroup}
                                     disabled={isLoading || isGroupLoading} />)}

        {serverGroups.length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            {isLoading || isGroupLoading ? "Loading..." : "No online data available..."}
          </Text>
        }
        {isLoading || serverGroups.length === 0 || serverGroups.filter(isOfSelectedLanguage).length > 0 ? undefined :
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
    color: colors.text.default
  },

  listContainer: { flex: 1 },

  emptyListText: {
    padding: 20,
    textAlign: "center",
    color: colors.text.default
  },

  refreshControl: {
    color: colors.text.lighter
  }
});
