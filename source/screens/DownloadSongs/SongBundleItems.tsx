import React from "react";
import { SongBundle } from "../../models/ServerSongsModel";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { SongBundle as LocalSongBundle } from "../../models/Songs";

interface SongBundleItemComponentProps {
  bundle: SongBundle;
  onPress: (bundle: SongBundle) => void;
}

export const SongBundleItem: React.FC<SongBundleItemComponentProps>
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
      {bundle.size === undefined ? undefined :
        <Text style={styles.songBundleItemInfoText}>
          {bundle.size} songs
        </Text>}
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

export const LocalSongBundleItem: React.FC<LocalSongBundleItemComponentProps>
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


const styles = StyleSheet.create({
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
  }
});
