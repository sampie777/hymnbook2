import React, { useEffect, useState } from "react";
import Config from "react-native-config";
import { SongBundle, SongBundle as LocalSongBundle } from "../../../logic/db/models/Songs";
import { SongBundle as ServerSongBundle } from "../../../logic/server/models/ServerSongsModel";
import { SongProcessor } from "../../../logic/songs/songProcessor";
import { Server } from "../../../logic/server/server";
import { rollbar } from "../../../logic/rollbar";
import { DeepLinking } from "../../../logic/deeplinking";
import { alertAndThrow, languageAbbreviationToFullName, sanitizeErrorForRollbar } from "../../../logic/utils";
import { itemCountPerLanguage } from "./common";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { debounce, useIsMounted } from "../../components/utils";
import {
  Alert,
  RefreshControl,
  ScrollView, Share,
  StyleSheet,
  Text,
  View
} from "react-native";
import { LocalSongBundleItem, SongBundleItem } from "./songBundleItems";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import LanguageSelectBar, { ShowAllLanguagesValue } from "./LanguageSelectBar";
import UrlLink from "../../components/UrlLink";
import { SongUpdater } from "../../../logic/songs/updater/songUpdater";
import { useUpdaterContext } from "../../components/providers/UpdaterContextProvider";
import Db from "../../../logic/db/db";
import { SongBundleSchema } from "../../../logic/db/models/SongsSchema";
import { CollectionChangeSet, OrderedCollection } from "realm";

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
  const [isSpecificBundleLoading, setIsSpecificBundleLoading] = useState(false);

  const [serverBundles, setServerBundles] = useState<ServerSongBundle[]>([]);
  const [localBundles, setLocalBundles] = useState<LocalSongBundle[]>([]);
  const [requestDownloadForBundle, setRequestDownloadForBundle] = useState<ServerSongBundle | undefined>(undefined);
  const [requestUpdateForBundle, setRequestUpdateForBundle] = useState<ServerSongBundle | undefined>(undefined);
  const [requestDeleteForBundle, setRequestDeleteForBundle] = useState<LocalSongBundle | undefined>(undefined);
  const [filterLanguage, setFilterLanguage] = useState("");
  const updaterContext = useUpdaterContext();
  const styles = createStyles(useTheme());

  useEffect(() => {
    onOpen();
    return onClose;
  }, []);

  const onOpen = () => {
    fetchServerSongBundles();
    try {
      Db.songs.realm().objects<SongBundle>(SongBundleSchema.name).addListener(onCollectionChange);
    } catch (error) {
      rollbar.error("Failed to handle SongBundle collection change", sanitizeErrorForRollbar(error));
    }
  };

  const onClose = () => {
    Db.songs.realm().objects<SongBundle>(SongBundleSchema.name).removeListener(onCollectionChange);
  };

  useEffect(() => {
    if (!isMounted()) return;

    // Let user navigate when the screen is still loading the data
    if (serverBundles.length === 0) return;

    setIsProcessing?.(isProcessingLocalData);
  }, [isProcessingLocalData]);

  useEffect(() => {
    if (isLocalDataLoading) return;
    loadAndPromptSpecificBundle();
  }, [promptForUuid, isLocalDataLoading]);

  const processLocalDataChanges = (collection: OrderedCollection<Realm.Object<SongBundle> & SongBundle>) => {
    if (!isMounted()) return;
    setIsLocalDataLoading(true);

    try {
      const data: SongBundle[] = collection
        .sorted(`name`)
        .map(it => SongBundle.clone(it, { includeSongs: true, includeVerses: false }))

      const distinctData: SongBundle[] = [];
      data.forEach(bundle => {
        if (distinctData.some(it => it.uuid == bundle.uuid)) return;
        distinctData.push(bundle);
      })

      setLocalBundles(distinctData);

      if (filterLanguage === "") {
        setFilterLanguage(SongProcessor.determineDefaultFilterLanguage(distinctData));
      }
    } catch (error) {
      rollbar.error("Failed to load local SongBundles from collection change", sanitizeErrorForRollbar(error));
    }

    setIsLocalDataLoading(false);
  };

  const processLocalDataChangesDebounced = debounce(processLocalDataChanges, 300);

  const onCollectionChange = (collection: OrderedCollection<Realm.Object<SongBundle> & SongBundle>, changes: CollectionChangeSet) => {
    if (!isMounted()) return;
    processLocalDataChangesDebounced(collection, changes);
  }

  const loadAndPromptSpecificBundle = () => {
    if (!promptForUuid) return;
    if (localBundles.find(it => it.uuid === promptForUuid)) return;

    setIsSpecificBundleLoading(true);
    Server.fetchSongBundle({ uuid: promptForUuid }, {})
      .then(data => {
        if (!isMounted()) return;

        if (localBundles.find(it => it.uuid === promptForUuid)) return;

        setFilterLanguage(data.language);
        setRequestDownloadForBundle(data);
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
        setIsSpecificBundleLoading(false);
      });
  };

  const fetchServerSongBundles = () => {
    setIsServerDataLoading(true);
    Server.fetchSongBundles()
      .then(data => {
        if (!isMounted()) return;
        setServerBundles(data);
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
    SongUpdater.updateLocalBundlesWithUuid(localBundles, serverBundles);
  };
  useEffect(applyUuidUpdateForPullRequest8, [serverBundles]);

  const isPopupOpen = () => requestDeleteForBundle !== undefined || requestDownloadForBundle !== undefined;

  const shareSongBundle = (it: LocalSongBundle | ServerSongBundle) => {
    return Share.share({
      message: `Download songs for ${it.name}\n\n${DeepLinking.generateLinkForSongBundle(it)}`
    })
      .then(r => rollbar.debug("Song bundle shared.", {
        shareAction: r,
        bundle: it
      }))
      .catch(error => rollbar.warning("Failed to share song bundle", {
        ...sanitizeErrorForRollbar(error),
        bundle: it
      }));
  };

  const onSongBundlePress = (bundle: ServerSongBundle) => {
    if (isProcessingLocalData || isPopupOpen()) return;

    setRequestDownloadForBundle(bundle);
  };

  const onLocalSongBundlePress = (bundle: LocalSongBundle) => {
    if (isProcessingLocalData || isPopupOpen()) return;

    if (SongProcessor.hasUpdate(serverBundles, bundle)) {
      const serverBundle = SongProcessor.getMatchingServerBundle(serverBundles, bundle);
      if (serverBundle !== undefined) {
        return setRequestUpdateForBundle(serverBundle);
      }
    }

    setRequestDeleteForBundle(bundle);
  };

  const onConfirmDownloadSongBundle = () => {
    const bundle = requestDownloadForBundle;
    setRequestDownloadForBundle(undefined);

    if (isProcessingLocalData || bundle === undefined) return;

    const isUpdating = updaterContext.songBundlesUpdating.some(it => it.uuid === bundle.uuid);
    if (isUpdating) return;

    downloadSongBundle(bundle);
  };

  const onConfirmUpdateSongBundle = () => {
    const bundle = requestUpdateForBundle;
    setRequestUpdateForBundle(undefined);

    if (isProcessingLocalData || bundle === undefined) return;

    const isUpdating = updaterContext.songBundlesUpdating.some(it => it.uuid === bundle.uuid);
    if (isUpdating) return;

    updateSongBundle(bundle);
  };

  const downloadSongBundle = (bundle: ServerSongBundle) => saveSongBundle(bundle, false);
  const updateSongBundle = (bundle: ServerSongBundle) => saveSongBundle(bundle, true);

  const saveSongBundle = (bundle: ServerSongBundle, isUpdate: boolean) => {
    if (!isMounted()) return;
    setIsProcessingLocalData(true);
    updaterContext.addSongBundleUpdating(bundle);

    const call = isUpdate
      ? SongUpdater.fetchAndUpdateSongBundle(bundle)
      : SongUpdater.fetchAndSaveSongBundle(bundle);

    call
      .then(() => Alert.alert("Success", `${bundle.name} ${isUpdate ? "updated" : "added"}!`))
      .catch(error => {
        rollbar.error("Failed to import song bundle", {
          ...sanitizeErrorForRollbar(error),
          isUpdate: isUpdate,
          bundle: bundle,
        });

        if (error.name == "TypeError" && error.message == "Network request failed") {
          Alert.alert("Error", `Could not ${isUpdate ? "update" : "download"} ${bundle.name}. Make sure your internet connection is working or try again later.`);
        } else {
          Alert.alert("Error", `Could not ${isUpdate ? "update" : "download"} ${bundle.name}. \n${error}\n\nTry again later.`);
        }
      })
      .finally(() => {
        if (!isMounted()) return;
        setIsProcessingLocalData(false);
      })
      .finally(() => {
        // Do this here after the state has been called, otherwise we get realm invalidation errors
        updaterContext.removeSongBundleUpdating(bundle);
      })
  };

  const onConfirmDeleteSongBundle = () => {
    const bundle = requestDeleteForBundle;
    setRequestDeleteForBundle(undefined);

    if (isProcessingLocalData || bundle === undefined) return;

    const isUpdating = updaterContext.songBundlesUpdating.some(it => it.uuid === bundle.uuid);
    if (isUpdating) {
      Alert.alert("Could not delete", "This bundle is being updated. Please wait until this operation is done and try again.")
      return;
    }

    deleteSongBundle(bundle);
  };

  const deleteSongBundle = (bundle: LocalSongBundle) => {
    setIsProcessingLocalData(true);
    updaterContext.removeSongBundleUpdating(bundle);

    try {
      const successMessage = SongProcessor.deleteSongBundle(bundle)
      Alert.alert("Success", successMessage);
    } catch (error) {
      alertAndThrow(error);
    } finally {
      if (isMounted()) {
        setIsProcessingLocalData(false);
      }
    }
  };

  const getAllLanguagesFromBundles = (bundles: ServerSongBundle[]) => {
    const languages = SongProcessor.getAllLanguagesFromBundles(bundles);

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
    <ConfirmationModal isOpen={requestDownloadForBundle !== undefined}
                       onClose={() => setRequestDownloadForBundle(undefined)}
                       onConfirm={onConfirmDownloadSongBundle}
                       invertConfirmColor={true}
                       message={`Download songs for ${requestDownloadForBundle?.name}?`} />

    <ConfirmationModal isOpen={requestUpdateForBundle !== undefined}
                       onClose={() => setRequestUpdateForBundle(undefined)}
                       onConfirm={onConfirmUpdateSongBundle}
                       invertConfirmColor={true}
                       message={`Update ${requestUpdateForBundle?.name}?`} />

    <ConfirmationModal isOpen={requestDeleteForBundle !== undefined}
                       onClose={() => setRequestDeleteForBundle(undefined)}
                       onConfirm={onConfirmDeleteSongBundle}
                       message={`Delete all songs for ${requestDeleteForBundle?.name}?`} />


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

    <LanguageSelectBar languages={getAllLanguagesFromBundles(serverBundles)}
                       selectedLanguage={filterLanguage}
                       onLanguageClick={setFilterLanguage}
                       itemCountPerLanguage={itemCountPerLanguage(localBundles)} />

    <ScrollView nestedScrollEnabled={true}
                style={styles.listContainer}
                refreshControl={<RefreshControl onRefresh={fetchServerSongBundles}
                                                tintColor={styles.refreshControl.color}
                                                refreshing={isProcessingLocalData || isSpecificBundleLoading || isLocalDataLoading || isServerDataLoading} />}>

      {localBundles
        .filter(isOfSelectedLanguage)
        .map((bundle: LocalSongBundle) =>
          <LocalSongBundleItem key={bundle.uuid + bundle.name}
                               bundle={bundle}
                               onPress={onLocalSongBundlePress}
                               onLongPress={shareSongBundle}
                               hasUpdate={SongProcessor.hasUpdate(serverBundles, bundle)}
                               disabled={isProcessingLocalData || isSpecificBundleLoading} />)}

      {serverBundles
        .filter(it => !SongProcessor.isBundleLocal(localBundles, it))
        .filter(isOfSelectedLanguage)
        .map((bundle: ServerSongBundle) =>
          <SongBundleItem key={bundle.uuid + bundle.name}
                          bundle={bundle}
                          onPress={onSongBundlePress}
                          onLongPress={shareSongBundle}
                          disabled={isProcessingLocalData || isSpecificBundleLoading || isLocalDataLoading || isServerDataLoading} />)}

      {serverBundles.length > 0 ? undefined :
        <Text style={styles.emptyListText}>
          {isServerDataLoading || isSpecificBundleLoading ? "Loading..." : "No online data available..."}
        </Text>
      }
      {isLocalDataLoading || isServerDataLoading || serverBundles.length === 0 || serverBundles.filter(isOfSelectedLanguage).length > 0 ? undefined :
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

  listContainer: { flex: 1 },

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
