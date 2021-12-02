import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import { SongBundle } from "../../models/ServerSongsModel";
import { SongBundle as LocalSongBundle } from "../../models/Songs";
import ConfirmationModal from "../../components/ConfirmationModal";
import { SongProcessor } from "../../scripts/songs/songProcessor";
import { Server } from "../../scripts/server/server";
import { LocalSongBundleItem, SongBundleItem } from "./SongBundleItems";
import LanguageSelectBar from "./LanguageSelectBar";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

interface ComponentProps {
}

const DownloadSongsScreen: React.FC<ComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bundles, setBundles] = useState<Array<SongBundle>>([]);
  const [localBundles, setLocalBundles] = useState<Array<LocalSongBundle>>([]);
  const [requestDownloadForBundle, setRequestDownloadForBundle] = useState<SongBundle | undefined>(undefined);
  const [requestDeleteForBundle, setRequestDeleteForBundle] = useState<LocalSongBundle | undefined>(undefined);
  const [requestDeleteAll, setRequestDeleteAll] = useState(false);
  const [filterLanguage, setFilterLanguage] = useState("");
  const styles = createStyles(useTheme());

  useEffect(() => {
    onOpen();
    return onClose;
  }, []);

  const onOpen = () => {
    loadLocalSongBundles();
    fetchSongBundles();
  };

  const onClose = () => {
  };

  const loadLocalSongBundles = () => {
    setIsLoading(true);

    const result = SongProcessor.loadLocalSongBundles();
    result.alert();
    result.throwIfException();

    if (result.data !== undefined) {
      setLocalBundles(result.data);
      setFilterLanguage(SongProcessor.determineDefaultFilterLanguage(result.data));
    } else {
      setLocalBundles([]);
      setFilterLanguage("");
    }
    setIsLoading(false);
  };

  const fetchSongBundles = () => {
    setIsLoading(true);
    Server.fetchSongBundles()
      .then(result => setBundles(result.data))
      .catch(error => Alert.alert("Error", `Could not fetch song bundles. \n${error}`))
      .finally(() => setIsLoading(false));
  };

  const isPopupOpen = () => requestDeleteAll || requestDeleteForBundle !== undefined || requestDownloadForBundle !== undefined;

  const onSongBundlePress = (bundle: SongBundle) => {
    if (isLoading || isPopupOpen()) {
      return;
    }

    setRequestDownloadForBundle(bundle);
  };

  const onLocalSongBundlePress = (bundle: LocalSongBundle) => {
    if (isLoading || isPopupOpen()) {
      return;
    }

    setRequestDeleteForBundle(bundle);
  };

  const onDeleteAllPress = () => {
    if (isLoading || isPopupOpen()) {
      return;
    }

    setRequestDeleteAll(true);
  };

  const onConfirmDownloadSongBundle = () => {
    const songBundle = requestDownloadForBundle;
    setRequestDownloadForBundle(undefined);

    if (isLoading || songBundle === undefined) {
      return;
    }

    downloadSongBundle(songBundle);
  };

  const downloadSongBundle = (bundle: SongBundle) => {
    setIsLoading(true);

    Server.fetchSongBundleWithSongsAndVerses(bundle)
      .then(result => saveSongBundle(result.data))
      .catch(error =>
        Alert.alert("Error", `Error fetching songs for song bundle ${bundle.name}: ${error}`))
      .finally(() => setIsLoading(false));
  };

  const saveSongBundle = (bundle: SongBundle) => {
    setIsLoading(true);

    const result = SongProcessor.saveSongBundleToDatabase(bundle);
    result.alert();
    result.throwIfException();

    setIsLoading(false);
    loadLocalSongBundles();
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

    loadLocalSongBundles();
  };

  const isBundleLocal = (bundle: SongBundle) => {
    return localBundles.some(it => it.name == bundle.name);
  };

  const onConfirmDeleteAll = () => {
    setRequestDeleteAll(false);
    setIsLoading(true);
    setLocalBundles([]);

    SongProcessor.deleteSongDatabase()
      .then(result => {
        result.alert();
        result.throwIfException();
      })
      .finally(() => {
        setIsLoading(false);
        loadLocalSongBundles();
      });
  };

  const getAllLanguagesFromBundles = (bundles: Array<SongBundle>) => {
    const languages = SongProcessor.getAllLanguagesFromBundles(bundles);

    if (languages.length > 0 && filterLanguage === "") {
      setFilterLanguage(languages[0]);
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

      <ConfirmationModal isOpen={requestDeleteForBundle !== undefined}
                         onClose={() => setRequestDeleteForBundle(undefined)}
                         onConfirm={onConfirmDeleteSongBundle}
                         message={`Delete all songs for ${requestDeleteForBundle?.name}?`} />

      <ConfirmationModal isOpen={requestDeleteAll}
                         onClose={() => setRequestDeleteAll(false)}
                         onConfirm={onConfirmDeleteAll}
                         message={`Delete ALL songs?`} />

      <Text style={styles.informationText}>Select a bundle to download or delete:</Text>

      <LanguageSelectBar languages={getAllLanguagesFromBundles(bundles)}
                         selectedLanguage={filterLanguage}
                         onLanguageClick={setFilterLanguage} />

      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl onRefresh={fetchSongBundles}
                                        refreshing={isLoading} />}>

        {localBundles.map((bundle: LocalSongBundle) =>
          <LocalSongBundleItem key={bundle.name}
                               bundle={bundle}
                               onPress={onLocalSongBundlePress} />)}

        {bundles.filter(it => !isBundleLocal(it))
          .filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase())
          .map((bundle: SongBundle) =>
            <SongBundleItem key={bundle.name}
                            bundle={bundle}
                            onPress={onSongBundlePress} />)}

        {bundles.length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            {isLoading ? "Loading..." : "No online data available..."}
          </Text>
        }
        {isLoading || bundles.length === 0 || bundles.filter(it => it.language.toUpperCase() === filterLanguage.toUpperCase()).length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            No bundles found for language "{filterLanguage}"...
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
