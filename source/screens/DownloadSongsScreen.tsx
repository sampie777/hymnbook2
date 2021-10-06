import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";
import { SongBundle } from "../models/ServerSongsModel";
import { SongBundle as LocalSongBundle } from "../models/Songs";
import DisposableMessage from "../components/DisposableMessage";
import ConfirmationModal from "../components/ConfirmationModal";
import Icon from "react-native-vector-icons/FontAwesome5";
import { SongProcessor } from "../scripts/songProcessor";
import { Server } from "../scripts/server/server";

interface SongBundleItemComponentProps {
  bundle: SongBundle;
  onPress: (bundle: SongBundle) => void;
}

const SongBundleItem: React.FC<SongBundleItemComponentProps>
  = ({
       bundle,
       onPress
     }) => {
  return (
    <TouchableOpacity onPress={() => onPress(bundle)}
                      style={styles.songBundleItemContainer}>
      <Text style={styles.songBundleItemText}>
        {bundle.name}
      </Text>
      <Icon name={"cloud-download-alt"}
            size={styles.songBundleItemIcon.fontSize}
            color={styles.songBundleItemIconDownload.color} />
    </TouchableOpacity>
  );
};

interface LocalSongBundleItemComponentProps {
  bundle: LocalSongBundle;
  onPress: (bundle: LocalSongBundle) => void;
}

const LocalSongBundleItem: React.FC<LocalSongBundleItemComponentProps>
  = ({
       bundle,
       onPress
     }) => {
  return (
    <TouchableOpacity onPress={() => onPress(bundle)}
                      style={styles.songBundleItemContainer}>
      <Text style={styles.songBundleItemText}>
        {bundle.name}
      </Text>
      <Text style={styles.songBundleItemInfoText}>
        {bundle.songs.length} songs
      </Text>
      <Icon name={"check"}
            size={styles.songBundleItemIcon.fontSize}
            color={styles.songBundleItemIconLocal.color} />
    </TouchableOpacity>
  );
};

interface ComponentProps {
}

const DownloadSongsScreen: React.FC<ComponentProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [localBundles, setLocalBundles] = useState<Array<LocalSongBundle>>([]);
  const [progressResult, setProgressResult] = useState("");
  const [requestDownloadForBundle, setRequestDownloadForBundle] = useState<SongBundle | undefined>(undefined);
  const [requestDeleteForBundle, setRequestDeleteForBundle] = useState<LocalSongBundle | undefined>(undefined);
  const [requestDeleteAll, setRequestDeleteAll] = useState(false);

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
    } else {
      setLocalBundles([]);
    }
    setIsLoading(false);
  };

  const fetchSongBundles = () => {
    setIsLoading(true);
    Server.fetchSongBundles()
      .then(result => setBundles(result.data))
      .catch(error => Alert.alert("Error", `Error fetching song bundles: ${error}`))
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

  return (
    <View style={styles.container}>
      <ConfirmationModal isOpen={requestDownloadForBundle !== undefined}
                         onClose={() => setRequestDownloadForBundle(undefined)}
                         onConfirm={onConfirmDownloadSongBundle}
                         invertConfirmColor={true}>
        <Text>Download songs for {requestDownloadForBundle?.name}?</Text>
      </ConfirmationModal>

      <ConfirmationModal isOpen={requestDeleteForBundle !== undefined}
                         onClose={() => setRequestDeleteForBundle(undefined)}
                         onConfirm={onConfirmDeleteSongBundle}>
        <Text>Delete all songs for {requestDeleteForBundle?.name}?</Text>
      </ConfirmationModal>

      <ConfirmationModal isOpen={requestDeleteAll}
                         onClose={() => setRequestDeleteAll(false)}
                         onConfirm={onConfirmDeleteAll}>
        <Text>Delete ALL songs?</Text>
      </ConfirmationModal>

      <DisposableMessage message={progressResult}
                         onPress={() => setProgressResult("")}
                         maxDuration={5000} />

      <Text style={styles.informationText}>Select a bundle to download or delete:</Text>
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl onRefresh={fetchSongBundles}
                                        refreshing={isLoading} />}>

        {localBundles.map((bundle: LocalSongBundle) =>
          <LocalSongBundleItem key={bundle.name}
                               bundle={bundle}
                               onPress={onLocalSongBundlePress} />)}

        {bundles.filter(it => !isBundleLocal(it))
          .map((bundle: SongBundle) =>
            <SongBundleItem key={bundle.name}
                            bundle={bundle}
                            onPress={onSongBundlePress} />)}

        {bundles.length > 0 ? null :
          <Text style={styles.emptyListText}>{isLoading ? "Loading..." : "No online data available..."}</Text>}
      </ScrollView>

      <TouchableHighlight style={styles.deleteAllButton}
                          onPress={onDeleteAllPress}>
        <Text style={styles.deleteAllButtonText}>Delete all</Text>
      </TouchableHighlight>
    </View>
  );
};

export default DownloadSongsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch"
  },

  informationText: {
    fontSize: 16,
    padding: 20
  },

  listContainer: {},

  songBundleItemContainer: {
    padding: 20,
    borderColor: "#ddd",
    borderBottomWidth: 1,
    backgroundColor: "#fafafa",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  songBundleItemText: {
    fontSize: 18,
    flexGrow: 1
  },
  songBundleItemInfoText: {
    fontSize: 13,
    color: "#888",
    paddingRight: 20
  },
  songBundleItemIcon: {
    fontSize: 18
  },
  songBundleItemIconDownload: {
    color: "dodgerblue"
  },
  songBundleItemIconLocal: {
    color: "#0d0"
  },

  emptyListText: {
    padding: 20,
    textAlign: "center"
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
