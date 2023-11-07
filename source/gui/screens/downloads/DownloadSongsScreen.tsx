import React, { useEffect, useState } from "react";
import Config from "react-native-config";
import { SongBundle as LocalSongBundle } from "../../../logic/db/models/Songs";
import { SongBundle as ServerSongBundle } from "../../../logic/server/models/ServerSongsModel";
import { SongProcessor } from "../../../logic/songs/songProcessor";
import { Server } from "../../../logic/server/server";
import { rollbar } from "../../../logic/rollbar";
import { DeepLinking } from "../../../logic/deeplinking";
import { languageAbbreviationToFullName, sanitizeErrorForRollbar } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
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
import LanguageSelectBar from "./LanguageSelectBar";
import UrlLink from "../../components/UrlLink";

interface ComponentProps {
  setIsProcessing?: (value: boolean) => void;
  promptForUuid?: string;
  dismissPromptForUuid?: () => void;
}

const DownloadSongsScreen: React.FC<ComponentProps> = ({ setIsProcessing, promptForUuid, dismissPromptForUuid }) => {
  let isMounted = true;
  const [isLoading, setIsLoading] = useState(false);
  const [isLocalBundlesLoading, setIsLocalBundlesLoading] = useState(true);
  const [isBundleLoading, setIsBundleLoading] = useState(false);
  const [serverBundles, setServerBundles] = useState<Array<ServerSongBundle>>([]);
  const [localBundles, setLocalBundles] = useState<Array<LocalSongBundle & Realm.Object>>([]);
  const [requestDownloadForBundle, setRequestDownloadForBundle] = useState<ServerSongBundle | undefined>(undefined);
  const [requestUpdateForBundle, setRequestUpdateForBundle] = useState<ServerSongBundle | undefined>(undefined);
  const [requestDeleteForBundle, setRequestDeleteForBundle] = useState<LocalSongBundle | undefined>(undefined);
  const [filterLanguage, setFilterLanguage] = useState("");
  const styles = createStyles(useTheme());

  useEffect(() => {
    onOpen();
    return onClose;
  }, []);

  const onOpen = () => {
    isMounted = true;
    loadLocalSongBundles();
    fetchSongBundles();
  };

  const onClose = () => {
    isMounted = false;
  };

  useEffect(() => {
    if (!isMounted) return;

    // Let user navigate when the screen is still loading the data
    if (serverBundles.length === 0) {
      return;
    }
    setIsProcessing?.(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (isLocalBundlesLoading) return;
    loadAndPromptSpecificBundle();
  }, [promptForUuid, isLocalBundlesLoading]);

  const loadAndPromptSpecificBundle = () => {
    if (!promptForUuid) return;
    if (localBundles.find(it => it.uuid === promptForUuid)) return;

    setIsBundleLoading(true);
    Server.fetchSongBundle({ uuid: promptForUuid }, {})
      .then(data => {
        if (!isMounted) return;

        if (localBundles.find(it => it.uuid === promptForUuid)) return;

        setFilterLanguage(data.language);
        setRequestDownloadForBundle(data);
      })
      .catch(error => Alert.alert("Error", `Could not fetch the song bundle.\n${error}\n\nTry again later.`))
      .finally(() => {
        dismissPromptForUuid?.();

        if (!isMounted) return;
        setIsBundleLoading(false);
      });
  };

  const loadLocalSongBundles = () => {
    setIsLoading(true);
    setIsLocalBundlesLoading(true);

    const result = SongProcessor.loadLocalSongBundles();
    result.alert();
    result.throwIfException();

    if (!isMounted) return;

    if (result.data !== undefined) {
      setLocalBundles(result.data);
    } else {
      setLocalBundles([]);
    }

    if (filterLanguage === "") {
      if (result.data !== undefined) {
        setFilterLanguage(SongProcessor.determineDefaultFilterLanguage(result.data));
      } else {
        setFilterLanguage("");
      }
    }

    setIsLoading(false);
    setIsLocalBundlesLoading(false);
  };

  const fetchSongBundles = () => {
    setIsLoading(true);
    Server.fetchSongBundles()
      .then(data => {
        if (!isMounted) return;
        setServerBundles(data);
      })
      .catch(error => Alert.alert("Error", `Could not fetch song bundles. \n${error}\n\nTry again later.`))
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
  };

  const applyUuidUpdateForPullRequest8 = () => {
    SongProcessor.updateLocalBundlesWithUuid(localBundles, serverBundles);
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
    if (isLoading || isPopupOpen()) {
      return;
    }

    setRequestDownloadForBundle(bundle);
  };

  const onLocalSongBundlePress = (bundle: LocalSongBundle) => {
    if (isLoading || isPopupOpen()) {
      return;
    }

    if (SongProcessor.hasUpdate(serverBundles, bundle)) {
      const serverBundle = SongProcessor.getMatchingServerBundle(serverBundles, bundle);
      if (serverBundle !== undefined) {
        return setRequestUpdateForBundle(serverBundle);
      }
    }

    setRequestDeleteForBundle(bundle);
  };


  const onConfirmDownloadSongBundle = () => {
    const songBundle = requestDownloadForBundle;
    setRequestDownloadForBundle(undefined);

    if (isLoading || songBundle === undefined) {
      return;
    }

    downloadSongBundle(songBundle);
  };

  const onConfirmUpdateSongBundle = () => {
    const songBundle = requestUpdateForBundle;
    setRequestUpdateForBundle(undefined);

    if (isLoading || songBundle === undefined) {
      return;
    }

    updateSongBundle(songBundle);
  };

  const downloadSongBundle = (bundle: ServerSongBundle) => {
    setIsLoading(true);

    Server.fetchSongBundleWithSongsAndVerses(bundle)
      .then(data => {
        if (!isMounted) return;
        saveSongBundle(data);
      })
      .catch(error =>
        Alert.alert("Error", `Error downloading ${bundle.name}: ${error}\n\nTry again later.`))
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
  };

  const saveSongBundle = (bundle: ServerSongBundle) => {
    setIsLoading(true);

    const result = SongProcessor.saveSongBundleToDatabase(bundle);
    result.alert();
    result.throwIfException();

    if (!isMounted) return;

    setIsLoading(false);
    loadLocalSongBundles();
  };

  const updateSongBundle = (bundle: ServerSongBundle) => {
    setIsLoading(true);

    SongProcessor.fetchAndUpdateSongBundle(bundle)
      .then(result => {
        result.alert();
        result.throwIfException();
      })
      .catch(error =>
        Alert.alert("Error", `Error updating ${bundle.name}: ${error}\n\nTry again later.`))
      .finally(() => {
        if (!isMounted) return;
        setLocalBundles([]);
        setIsLoading(false);
        loadLocalSongBundles();
      });
  };

  const onConfirmDeleteSongBundle = () => {
    const bundle = requestDeleteForBundle;
    setRequestDeleteForBundle(undefined);

    if (isLoading || bundle === undefined) {
      return;
    }

    deleteSongBundle(bundle);
  };

  const deleteSongBundle = (bundle: LocalSongBundle) => {
    setIsLoading(true);

    const result = SongProcessor.deleteSongBundle(bundle);
    result.alert();
    result.throwIfException();

    if (!isMounted) return;

    loadLocalSongBundles();
  };

  const getAllLanguagesFromBundles = (bundles: Array<ServerSongBundle>) => {
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

  return (
    <View style={styles.container}>
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
                         onLanguageClick={setFilterLanguage} />

      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl onRefresh={fetchSongBundles}
                                        tintColor={styles.refreshControl.color}
                                        refreshing={isLoading || isBundleLoading} />}>

        {localBundles.filter(it => it.isValid())
          .map((bundle: LocalSongBundle) =>
            <LocalSongBundleItem key={bundle.uuid + bundle.name}
                                 bundle={bundle}
                                 onPress={onLocalSongBundlePress}
                                 onLongPress={shareSongBundle}
                                 hasUpdate={SongProcessor.hasUpdate(serverBundles, bundle)}
                                 disabled={isLoading || isBundleLoading} />)}

        {serverBundles.filter(it => !SongProcessor.isBundleLocal(localBundles, it))
          .filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase())
          .map((bundle: ServerSongBundle) =>
            <SongBundleItem key={bundle.uuid + bundle.name}
                            bundle={bundle}
                            onPress={onSongBundlePress}
                            onLongPress={shareSongBundle}
                            disabled={isLoading || isBundleLoading} />)}

        {serverBundles.length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            {isLoading || isBundleLoading ? "Loading..." : "No online data available..."}
          </Text>
        }
        {isLoading || serverBundles.length === 0 || serverBundles.filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase()).length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            No bundles found for language "{languageAbbreviationToFullName(filterLanguage)}"...
          </Text>
        }
      </ScrollView>
    </View>
  );
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

  listContainer: {},

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
