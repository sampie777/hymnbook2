import React, { useEffect, useState } from "react";
import { DocumentGroup, DocumentGroup as LocalDocumentGroup } from "../../../logic/db/models/documents/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../../logic/server/models/Documents";
import { DocumentProcessor } from "../../../logic/documents/documentProcessor";
import { DocumentServer } from "../../../logic/documents/documentServer";
import { DeepLinking } from "../../../logic/deeplinking";
import { rollbar } from "../../../logic/rollbar";
import { languageAbbreviationToFullName, sanitizeErrorForRollbar } from "../../../logic/utils/utils.ts";
import { itemCountPerLanguage } from "./common";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { debounce, useIsMounted } from "../../components/utils";
import { Alert, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { LocalDocumentGroupItem, ServerDocumentGroupItem } from "./documentGroupItems";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import LanguageSelectBar, { ShowAllLanguagesValue } from "./LanguageSelectBar";
import { DocumentUpdater } from "../../../logic/documents/updater/documentUpdater";
import { useUpdaterContext } from "../../components/providers/UpdaterContextProvider";
import Db from "../../../logic/db/db";
import { DocumentGroupSchema } from "../../../logic/db/models/documents/DocumentsSchema";
import { CollectionChangeSet, OrderedCollection } from "realm";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { isConnectionError } from "../../../logic/apiUtils";

type ServerDataType = ServerDocumentGroup;
type LocalDataType = LocalDocumentGroup;
type ItemType = DocumentGroup;

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
  const [isProcessingLocalData, setIsProcessingLocalData] = useState(false);
  const [isServerDataLoading, setIsServerDataLoading] = useState(false);
  const [isLocalDataLoading, setIsLocalDataLoading] = useState(true);
  const [isSpecificItemLoading, setIsSpecificItemLoading] = useState(false);

  const [serverData, setServerData] = useState<ServerDataType[]>([]);
  const [localData, setLocalData] = useState<LocalDataType[]>([]);
  const [requestDownloadForItem, setRequestDownloadForItem] = useState<ServerDataType | undefined>(undefined);
  const [requestUpdateForItem, setRequestUpdateForItem] = useState<ServerDataType | undefined>(undefined);
  const [requestDeleteForItem, setRequestDeleteForItem] = useState<LocalDataType | undefined>(undefined);
  const [filterLanguage, setFilterLanguage] = useState("");
  const updaterContext = useUpdaterContext();
  const styles = createStyles(useTheme());

  useEffect(() => {
    onOpen();
    return onClose;
  }, []);

  const onOpen = () => {
    fetchServerData();
    try {
      Db.documents.realm().objects<ItemType>(DocumentGroupSchema.name)
        .filtered(`isRoot = true`)
        .addListener(onCollectionChange);
    } catch (error) {
      rollbar.error("Failed to handle DocumentGroup collection change", sanitizeErrorForRollbar(error));
    }
  };

  const onClose = () => {
    Db.documents.realm().objects<ItemType>(DocumentGroupSchema.name)
      .filtered(`isRoot = true`)
      .removeListener(onCollectionChange);
  };

  useEffect(() => {
    if (!isMounted()) return;

    // Let user navigate when the screen is still loading the data
    if (serverData.length === 0) return;

    setIsProcessing?.(isProcessingLocalData);
  }, [isProcessingLocalData]);

  useEffect(() => {
    if (isLocalDataLoading) return;
    loadAndPromptSpecificItem();
  }, [promptForUuid, isLocalDataLoading]);

  const processLocalDataChanges = (collection: OrderedCollection<Realm.Object<ItemType> & ItemType>) => {
    if (!isMounted()) return;
    setIsLocalDataLoading(true);

    try {
      const data: ItemType[] = collection
        .sorted(`name`)
        .map(it => DocumentGroup.clone(it, { includeChildren: true, includeParent: false }))

      const distinctData: ItemType[] = [];
      data.forEach(item => {
        if (distinctData.some(it => it.uuid == item.uuid)) return;
        distinctData.push(item);
      })

      setLocalData(distinctData);

      if (filterLanguage === "") {
        setFilterLanguage(DocumentProcessor.determineDefaultFilterLanguage(distinctData));
      }
    } catch (error) {
      rollbar.error("Failed to load local DocumentGroups from collection change", sanitizeErrorForRollbar(error));
    }

    setIsLocalDataLoading(false);
  };

  const processLocalDataChangesDebounced = debounce(processLocalDataChanges, 300);

  const onCollectionChange = (collection: OrderedCollection<Realm.Object<ItemType> & ItemType>, changes: CollectionChangeSet) => {
    if (!isMounted()) return;
    processLocalDataChangesDebounced(collection, changes);
  }

  const loadAndPromptSpecificItem = () => {
    if (!promptForUuid) return;
    if (localData.find(it => it.uuid === promptForUuid)) return;

    setIsSpecificItemLoading(true);
    DocumentServer.fetchDocumentGroup({ uuid: promptForUuid }, {})
      .then(data => {
        if (!isMounted()) return;

        if (localData.find(it => it.uuid === promptForUuid)) return;

        setFilterLanguage(data.language);
        setRequestDownloadForItem(data);
      })
      .catch(error => {
        if (isConnectionError(error)) {
          Alert.alert("Error", "Could not load documents group. Make sure your internet connection is working or try again later.")
        } else {
          Alert.alert("Error", `Could not load documents group. \n${error}\n\nTry again later.`);
        }
      })
      .finally(() => {
        dismissPromptForUuid?.();

        if (!isMounted()) return;
        setIsSpecificItemLoading(false);
      });
  };

  const fetchServerData = () => {
    setIsServerDataLoading(true);
    DocumentServer.fetchDocumentGroups()
      .then(data => {
        if (!isMounted()) return;
        setServerData(data);
      })
      .catch(error => {
        if (isConnectionError(error)) {
          Alert.alert("Error", "Could not load documents. Make sure your internet connection is working or try again later.")
        } else {
          Alert.alert("Error", `Could not load documents. \n${error}\n\nTry again later.`);
        }
      })
      .finally(() => {
        if (!isMounted()) return;
        setIsServerDataLoading(false);
      });
  };

  const applyUuidUpdateForPullRequest8 = () => {
    DocumentUpdater.updateLocalGroupsWithUuid(localData, serverData);
  };
  useEffect(applyUuidUpdateForPullRequest8, [serverData]);

  const isPopupOpen = () => requestDeleteForItem !== undefined || requestDownloadForItem !== undefined;

  const shareItem = (it: LocalDataType | ServerDataType) => {
    return Share.share({
      message: `Download documents for ${it.name}\n\n${DeepLinking.generateLinkForDocumentGroup(it)}`
    })
      .then(r => rollbar.debug("DocumentGroup shared.", {
        shareAction: r,
        bundle: it
      }))
      .catch(error => rollbar.warning("Failed to share DocumentGroup", {
        ...sanitizeErrorForRollbar(error),
        bundle: it
      }));
  };

  const onServerItemPress = (item: ServerDataType) => {
    if (isProcessingLocalData || isPopupOpen()) return;

    setRequestDownloadForItem(item);
  };

  const onLocalItemPress = (item: LocalDataType) => {
    if (isProcessingLocalData || isPopupOpen()) return;

    if (DocumentProcessor.hasUpdate(serverData, item)) {
      const serverItem = DocumentProcessor.getMatchingServerGroup(serverData, item);
      if (serverItem !== undefined) {
        return setRequestUpdateForItem(serverItem);
      }
    }

    setRequestDeleteForItem(item);
  };

  const onConfirmDownload = () => {
    const item = requestDownloadForItem;
    setRequestDownloadForItem(undefined);

    if (isProcessingLocalData || item === undefined) return;

    const isUpdating = updaterContext.documentGroupsUpdating.some(it => it.uuid === item.uuid);
    if (isUpdating) return;

    downloadItem(item);
  };

  const onConfirmUpdate = () => {
    const item = requestUpdateForItem;
    setRequestUpdateForItem(undefined);

    if (isProcessingLocalData || item === undefined) return;

    const isUpdating = updaterContext.documentGroupsUpdating.some(it => it.uuid === item.uuid);
    if (isUpdating) return;

    updateItem(item);
  };

  const downloadItem = (item: ServerDataType) => saveItem(item, false);
  const updateItem = (item: ServerDataType) => saveItem(item, true);

  const saveItem = (item: ServerDataType, isUpdate: boolean) => {
    if (!isMounted()) return;
    setIsProcessingLocalData(true);
    updaterContext.addDocumentGroupUpdating(item);

    const call = isUpdate
      ? DocumentUpdater.fetchAndUpdateDocumentGroup(item)
      : DocumentUpdater.fetchAndSaveDocumentGroup(item);

    call
      .then(() => Alert.alert("Success", `${item.name} ${isUpdate ? "updated" : "added"}!`))
      .catch(error => {
        if (isConnectionError(error)) {
          Alert.alert("Error", `Could not ${isUpdate ? "update" : "download"} ${item.name}. Make sure your internet connection is working or try again later.`);
        } else {
          Alert.alert("Error", `Could not ${isUpdate ? "update" : "download"} ${item.name}. \n${error}\n\nTry again later.`);

          rollbar.error("Failed to import DocumentGroup", {
            ...sanitizeErrorForRollbar(error),
            isUpdate: isUpdate,
            item: item,
          });
        }
      })
      .finally(() => {
        if (!isMounted()) return;
        setIsProcessingLocalData(false);
      })
      .finally(() => {
        // Do this here after the state has been called, otherwise we get realm invalidation errors
        updaterContext.removeDocumentGroupUpdating(item);
      })
  };

  const onConfirmDelete = () => {
    const item = requestDeleteForItem;
    setRequestDeleteForItem(undefined);

    if (isProcessingLocalData || item === undefined) return;

    const isUpdating = updaterContext.documentGroupsUpdating.some(it => it.uuid === item.uuid);
    if (isUpdating) {
      Alert.alert("Could not delete", "This group is being updated. Please wait until this operation is done and try again.")
      return;
    }

    deleteItem(item);
  };

  const deleteItem = (item: LocalDataType) => {
    setIsProcessingLocalData(true);
    updaterContext.removeDocumentGroupUpdating(item);

    const result = DocumentProcessor.deleteDocumentGroup(item);
    result.alert();
    setIsProcessingLocalData(false);
    result.throwIfException();
  };

  const getAllLanguagesFromServerData = (data: ServerDataType[]) => {
    const languages = DocumentProcessor.getAllLanguagesFromDocumentGroups(data);

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

  return <View style={styles.container}>
    <ConfirmationModal isOpen={requestDownloadForItem !== undefined}
                       onClose={() => setRequestDownloadForItem(undefined)}
                       onConfirm={onConfirmDownload}
                       invertConfirmColor={true}
                       message={`Download documents for ${requestDownloadForItem?.name}?`} />

    <ConfirmationModal isOpen={requestUpdateForItem !== undefined}
                       onClose={() => setRequestUpdateForItem(undefined)}
                       onConfirm={onConfirmUpdate}
                       invertConfirmColor={true}
                       message={`Update ${requestUpdateForItem?.name}?`} />

    <ConfirmationModal isOpen={requestDeleteForItem !== undefined}
                       onClose={() => setRequestDeleteForItem(undefined)}
                       onConfirm={onConfirmDelete}
                       confirmationStyle={{ color: useTheme().colors.text.error }}
                       message={`Delete all documents for ${requestDeleteForItem?.name}?`} />

    <Text style={styles.informationText}>Select documents to download or delete:</Text>

    <LanguageSelectBar languages={getAllLanguagesFromServerData(serverData)}
                       selectedLanguage={filterLanguage}
                       onLanguageClick={setFilterLanguage}
                       itemCountPerLanguage={itemCountPerLanguage(localData)} />

    <ScrollView nestedScrollEnabled={true}
                style={styles.listContainer}
                contentContainerStyle={{paddingBottom: 100}}
                refreshControl={<RefreshControl onRefresh={fetchServerData}
                                                tintColor={styles.refreshControl.color}
                                                refreshing={isProcessingLocalData || isSpecificItemLoading || isLocalDataLoading || isServerDataLoading} />}>

      {localData
        .filter(isOfSelectedLanguage)
        .map((item: LocalDataType, index) =>
          <Animated.View key={item.uuid + item.name}
                         entering={FadeInUp.duration(200).delay(index * 30)}
                         exiting={FadeOut.duration(200).delay(index * 30)}>
            <LocalDocumentGroupItem group={item}
                                    onPress={onLocalItemPress}
                                    onLongPress={shareItem}
                                    hasUpdate={DocumentProcessor.hasUpdate(serverData, item)}
                                    disabled={isProcessingLocalData || isSpecificItemLoading} />
          </Animated.View>)}

      {serverData
        .filter(it => !DocumentProcessor.isGroupLocal(localData, it))
        .filter(isOfSelectedLanguage)
        .map((item: ServerDataType, index) =>
          <Animated.View key={item.uuid + item.name}
                         entering={FadeInUp.duration(200).delay(index * 30)}
                         exiting={FadeOut.duration(200).delay(index * 30)}>
            <ServerDocumentGroupItem group={item}
                                     onPress={onServerItemPress}
                                     onLongPress={shareItem}
                                     disabled={isProcessingLocalData || isSpecificItemLoading || isLocalDataLoading || isServerDataLoading} />
          </Animated.View>)}

      {serverData.length > 0 ? undefined :
        <Text style={styles.emptyListText}>
          {isServerDataLoading || isSpecificItemLoading ? "Loading..." : "No online data available..."}
        </Text>
      }
      {isLocalDataLoading || isServerDataLoading || serverData.length === 0 || serverData.filter(isOfSelectedLanguage).length > 0 ? undefined :
        <Text style={styles.emptyListText}>
          No documents found for language "{languageAbbreviationToFullName(filterLanguage)}"...
        </Text>
      }
    </ScrollView>
  </View>;
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

  listContainer: {
    flex: 1,
    minHeight: 100,
  },

  emptyListText: {
    padding: 20,
    textAlign: "center",
    color: colors.text.default
  },

  refreshControl: {
    color: colors.text.lighter
  }
});
