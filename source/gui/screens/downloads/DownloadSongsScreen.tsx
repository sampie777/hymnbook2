import React, { useEffect, useState } from "react";
import Config from "react-native-config";
import { SongBundle, SongBundle as LocalSongBundle } from "../../../logic/db/models/songs/Songs";
import { SongBundle as ServerSongBundle } from "../../../logic/server/models/ServerSongsModel";
import { SongProcessor } from "../../../logic/songs/songProcessor";
import { Server } from "../../../logic/server/server";
import { rollbar } from "../../../logic/rollbar";
import { DeepLinking } from "../../../logic/deeplinking";
import { alertAndThrow, languageAbbreviationToFullName, sanitizeErrorForRollbar } from "../../../logic/utils";
import { itemCountPerLanguage } from "./common";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { debounce, useIsMounted } from "../../components/utils";
import { Alert, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { LocalSongBundleItem, SongBundleItem } from "./songBundleItems";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import LanguageSelectBar, { ShowAllLanguagesValue } from "./LanguageSelectBar";
import UrlLink from "../../components/UrlLink";
import { SongUpdater } from "../../../logic/songs/updater/songUpdater";
import { useUpdaterContext } from "../../components/providers/UpdaterContextProvider";
import Db from "../../../logic/db/db";
import { SongBundleSchema } from "../../../logic/db/models/songs/SongsSchema";
import { CollectionChangeSet, OrderedCollection } from "realm";

type ServerDataType = ServerSongBundle;
type LocalDataType = LocalSongBundle;
type ItemType = SongBundle;

interface ComponentProps {
  setIsProcessing?: (value: boolean) => void;
  promptForUuid?: string;
  dismissPromptForUuid?: () => void;
}

const DownloadSongsScreen: React.FC<ComponentProps> = ({
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
      Db.songs.realm().objects<ItemType>(SongBundleSchema.name).addListener(onCollectionChange);
    } catch (error) {
      rollbar.error("Failed to handle SongBundle collection change", sanitizeErrorForRollbar(error));
    }
  };

  const onClose = () => {
    Db.songs.realm().objects<ItemType>(SongBundleSchema.name).removeListener(onCollectionChange);
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
        .map(it => SongBundle.clone(it, { includeSongs: true, includeVerses: false }))

      const distinctData: ItemType[] = [];
      data.forEach(item => {
        if (distinctData.some(it => it.uuid == item.uuid)) return;
        distinctData.push(item);
      })

      setLocalData(distinctData);

      if (filterLanguage === "") {
        setFilterLanguage(SongProcessor.determineDefaultFilterLanguage(distinctData));
      }
    } catch (error) {
      rollbar.error("Failed to load local SongBundles from collection change", sanitizeErrorForRollbar(error));
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
    Server.fetchSongBundle({ uuid: promptForUuid }, {})
      .then(data => {
        if (!isMounted()) return;

        if (localData.find(it => it.uuid === promptForUuid)) return;

        setFilterLanguage(data.language);
        setRequestDownloadForItem(data);
      })
      .catch(error => {
        if (error.name == "TypeError" && error.message == "Network request failed") {
          Alert.alert("Error", "Could not load song bundle. Make sure your internet connection is working or try again later.");
        } else {
          Alert.alert("Error", `Could not load song bundle. \n${error}\n\nTry again later.`);
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
    Server.fetchSongBundles()
      .then(data => {
        if (!isMounted()) return;
        setServerData(data);
      })
      .catch(error => {
        if (error.name == "TypeError" && error.message == "Network request failed") {
          Alert.alert("Error", "Could not load song bundles. Make sure your internet connection is working or try again later.");
        } else {
          Alert.alert("Error", `Could not load song bundles. \n${error}\n\nTry again later.`);
        }
      })
      .finally(() => {
        if (!isMounted()) return;
        setIsServerDataLoading(false);
      });
  };

  const applyUuidUpdateForPullRequest8 = () => {
    SongUpdater.updateLocalBundlesWithUuid(localData, serverData);
  };
  useEffect(applyUuidUpdateForPullRequest8, [serverData]);

  const isPopupOpen = () => requestDeleteForItem !== undefined || requestDownloadForItem !== undefined;

  const shareItem = (it: LocalDataType | ServerDataType) => {
    return Share.share({
      message: `Download songs for ${it.name}\n\n${DeepLinking.generateLinkForSongBundle(it)}`
    })
      .then(r => rollbar.debug("SongBundle shared.", {
        shareAction: r,
        bundle: it
      }))
      .catch(error => rollbar.warning("Failed to share SongBundle", {
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

    if (SongProcessor.hasUpdate(serverData, item)) {
      const serverItem = SongProcessor.getMatchingServerBundle(serverData, item);
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

    const isUpdating = updaterContext.songBundlesUpdating.some(it => it.uuid === item.uuid);
    if (isUpdating) return;

    downloadItem(item);
  };

  const onConfirmUpdate = () => {
    const item = requestUpdateForItem;
    setRequestUpdateForItem(undefined);

    if (isProcessingLocalData || item === undefined) return;

    const isUpdating = updaterContext.songBundlesUpdating.some(it => it.uuid === item.uuid);
    if (isUpdating) return;

    updateItem(item);
  };

  const downloadItem = (item: ServerDataType) => saveItem(item, false);
  const updateItem = (item: ServerDataType) => saveItem(item, true);

  const saveItem = (item: ServerDataType, isUpdate: boolean) => {
    if (!isMounted()) return;
    setIsProcessingLocalData(true);
    updaterContext.addSongBundleUpdating(item);

    const call = isUpdate
      ? SongUpdater.fetchAndUpdateSongBundle(item)
      : SongUpdater.fetchAndSaveSongBundle(item);

    call
      .then(() => Alert.alert("Success", `${item.name} ${isUpdate ? "updated" : "added"}!`))
      .catch(error => {
        if (error.name == "TypeError" && error.message == "Network request failed") {
          Alert.alert("Error", `Could not ${isUpdate ? "update" : "download"} ${item.name}. Make sure your internet connection is working or try again later.`);
        } else {
          Alert.alert("Error", `Could not ${isUpdate ? "update" : "download"} ${item.name}. \n${error}\n\nTry again later.`);

          rollbar.error("Failed to import SongBundle", {
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
        updaterContext.removeSongBundleUpdating(item);
      })
  };

  const onConfirmDelete = () => {
    const item = requestDeleteForItem;
    setRequestDeleteForItem(undefined);

    if (isProcessingLocalData || item === undefined) return;

    const isUpdating = updaterContext.songBundlesUpdating.some(it => it.uuid === item.uuid);
    if (isUpdating) {
      Alert.alert("Could not delete", "This bundle is being updated. Please wait until this operation is done and try again.")
      return;
    }

    deleteItem(item);
  };

  const deleteItem = (item: LocalDataType) => {
    setIsProcessingLocalData(true);
    updaterContext.removeSongBundleUpdating(item);

    try {
      const successMessage = SongProcessor.deleteSongBundle(item)
      Alert.alert("Success", successMessage);
    } catch (error) {
      alertAndThrow(error);
    } finally {
      if (isMounted()) {
        setIsProcessingLocalData(false);
      }
    }
  };

  const getAllLanguagesFromServerData = (data: ServerDataType[]) => {
    const languages = SongProcessor.getAllLanguagesFromBundles(data);

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
                       message={`Download songs for ${requestDownloadForItem?.name}?`} />

    <ConfirmationModal isOpen={requestUpdateForItem !== undefined}
                       onClose={() => setRequestUpdateForItem(undefined)}
                       onConfirm={onConfirmUpdate}
                       invertConfirmColor={true}
                       message={`Update ${requestUpdateForItem?.name}?`} />

    <ConfirmationModal isOpen={requestDeleteForItem !== undefined}
                       onClose={() => setRequestDeleteForItem(undefined)}
                       onConfirm={onConfirmDelete}
                       confirmationStyle={{ color: useTheme().colors.text.error }}
                       message={`Delete all songs for ${requestDeleteForItem?.name}?`} />


    <Text style={[styles.informationText, styles.subtleInformationText]}>We are still sorting out all the song
      licenses, so we trust that you take the
      responsibility to make sure you have the correct licenses for the songs you download.</Text>

    <Text style={[styles.informationText, styles.subtleInformationText]}>
      If you want to download a song bundle which is not displayed, please feel free to
      <UrlLink url={`mailto:${Config.DEVELOPER_EMAIL}?subject=Hymnbook`} textOnly={true}>
        <Text style={styles.webpageLink}> contact us</Text>
      </UrlLink>.
    </Text>

    <Text style={styles.informationText}>Select a song bundle to download or delete:</Text>

    <LanguageSelectBar languages={getAllLanguagesFromServerData(serverData)}
                       selectedLanguage={filterLanguage}
                       onLanguageClick={setFilterLanguage}
                       itemCountPerLanguage={itemCountPerLanguage(localData)} />

    <ScrollView nestedScrollEnabled={true}
                style={styles.listContainer}
                refreshControl={<RefreshControl onRefresh={fetchServerData}
                                                tintColor={styles.refreshControl.color}
                                                refreshing={isProcessingLocalData || isSpecificItemLoading || isLocalDataLoading || isServerDataLoading} />}>

      {localData
        .filter(isOfSelectedLanguage)
        .map((item: LocalDataType) =>
          <LocalSongBundleItem key={item.uuid + item.name}
                               bundle={item}
                               onPress={onLocalItemPress}
                               onLongPress={shareItem}
                               hasUpdate={SongProcessor.hasUpdate(serverData, item)}
                               disabled={isProcessingLocalData || isSpecificItemLoading} />)}

      {serverData
        .filter(it => !SongProcessor.isBundleLocal(localData, it))
        .filter(isOfSelectedLanguage)
        .map((item: ServerDataType) =>
          <SongBundleItem key={item.uuid + item.name}
                          bundle={item}
                          onPress={onServerItemPress}
                          onLongPress={shareItem}
                          disabled={isProcessingLocalData || isSpecificItemLoading || isLocalDataLoading || isServerDataLoading} />)}

      {serverData.length > 0 ? undefined :
        <Text style={styles.emptyListText}>
          {isServerDataLoading || isSpecificItemLoading ? "Loading..." : "No online data available..."}
        </Text>
      }
      {isLocalDataLoading || isServerDataLoading || serverData.length === 0 || serverData.filter(isOfSelectedLanguage).length > 0 ? undefined :
        <Text style={styles.emptyListText}>
          No bundles found for language "{languageAbbreviationToFullName(filterLanguage)}"...
        </Text>
      }
    </ScrollView>
  </View>;
};

export default DownloadSongsScreen;

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
  subtleInformationText: {
    color: colors.text.lighter
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
  },

  webpageLink: {
    color: colors.url
  }
});
