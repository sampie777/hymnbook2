import React, { useEffect, useState } from "react";
import { SongBundle as LocalSongBundle } from "../../../logic/db/models/Songs";
import { SongBundle as ServerSongBundle } from "../../../logic/server/models/ServerSongsModel";
import { SongProcessor } from "../../../logic/songs/songProcessor";
import { Server } from "../../../logic/server/server";
import { dateFrom, languageAbbreviationToFullName } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { LocalSongBundleItem, SongBundleItem } from "./songBundleItems";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import LanguageSelectBar from "./LanguageSelectBar";

interface ComponentProps {
  setIsProcessing?: (value: boolean) => void;
}

const DownloadSongsScreen: React.FC<ComponentProps> = ({ setIsProcessing }) => {
  let isMounted = true;
  const [isLoading, setIsLoading] = useState(false);
  const [bundles, setBundles] = useState<Array<ServerSongBundle>>([]);
  const [localBundles, setLocalBundles] = useState<Array<LocalSongBundle>>([]);
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
    // Let user navigate when the screen is still loading the data
    if (bundles.length === 0) {
      return
    }
    setIsProcessing?.(isLoading);
  }, [isLoading]);

  const loadLocalSongBundles = () => {
    setIsLoading(true);

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
  };

  const fetchSongBundles = () => {
    setIsLoading(true);
    Server.fetchSongBundles()
      .then(result => {
        if (!isMounted) return;
        setBundles(result.data);
      })
      .catch(error => Alert.alert("Error", `Could not fetch song bundles. \n${error}`))
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
  };

  const isPopupOpen = () => requestDeleteForBundle !== undefined || requestDownloadForBundle !== undefined;

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

    if (hasUpdate(bundle)) {
      const serverBundle = bundles.find(it => it.name == bundle.name);
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
      .then(result => {
        if (!isMounted) return;
        saveSongBundle(result.data);
      })
      .catch(error =>
        Alert.alert("Error", `Error downloading songs for song bundle ${bundle.name}: ${error}`))
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
        Alert.alert("Error", `Error updating song bundle ${bundle.name}: ${error}`))
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

  const isBundleLocal = (serverBundle: ServerSongBundle) => {
    return localBundles.some(it => it.name == serverBundle.name);
  };

  const hasUpdate = (localBundle: LocalSongBundle) => {
    const serverBundle = bundles.find(it => it.name == localBundle.name);
    if (serverBundle === undefined) {
      return false;
    }

    const serverDate = dateFrom(serverBundle.modifiedAt);
    const localDate = localBundle.modifiedAt;
    return serverDate > localDate;
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


      <Text style={styles.informationText}>Select a song bundle to download or delete:</Text>

      <LanguageSelectBar languages={getAllLanguagesFromBundles(bundles)}
                         selectedLanguage={filterLanguage}
                         onLanguageClick={setFilterLanguage}
                         disabled={isLoading}/>

      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl onRefresh={fetchSongBundles}
                                        refreshing={isLoading} />}>

        {localBundles.map((bundle: LocalSongBundle) =>
          <LocalSongBundleItem key={bundle.name}
                               bundle={bundle}
                               onPress={onLocalSongBundlePress}
                               hasUpdate={hasUpdate(bundle)}
                               disabled={isLoading} />)}

        {bundles.filter(it => !isBundleLocal(it))
          .filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase())
          .map((bundle: ServerSongBundle) =>
            <SongBundleItem key={bundle.name}
                            bundle={bundle}
                            onPress={onSongBundlePress}
                            disabled={isLoading} />)}

        {bundles.length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            {isLoading ? "Loading..." : "No online data available..."}
          </Text>
        }
        {isLoading || bundles.length === 0 || bundles.filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase()).length > 0 ? undefined :
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
    color: colors.text
  },

  listContainer: {},

  emptyListText: {
    padding: 20,
    textAlign: "center",
    color: colors.text
  }
});
