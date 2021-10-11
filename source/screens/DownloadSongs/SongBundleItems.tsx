import React from "react";
import { SongBundle } from "../../models/ServerSongsModel";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
      <View style={styles.songBundleItemInfoContainer}>
        {bundle.language === undefined || bundle.language === "" ? undefined :
          <Text style={styles.songBundleItemInfoText}>
            {bundle.language}
          </Text>
        }
        {bundle.size === undefined ? undefined :
          <Text style={styles.songBundleItemInfoText}>
            {bundle.size} songs
          </Text>
        }
      </View>
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
      <View style={styles.songBundleItemInfoContainer}>
        {bundle.language === undefined || bundle.language === "" ? undefined :
          <Text style={styles.songBundleItemInfoText}>
            {bundle.language}
          </Text>
        }
        <Text style={styles.songBundleItemInfoText}>
          {bundle.songs.length} songs
        </Text>
      </View>
      <Icon name={"check"}
            size={styles.songBundleItemIcon.fontSize}
            color={styles.songBundleItemIconLocal.color} />
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  songBundleItemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderColor: "#ddd",
    borderBottomWidth: 1,
    backgroundColor: "#fafafa",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  songBundleItemText: {
    fontSize: 17,
    flexGrow: 1
  },
  songBundleItemInfoContainer: {
    paddingRight: 20,
    alignItems: "flex-end"
  },
  songBundleItemInfoText: {
    fontSize: 13,
    color: "#888"
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
