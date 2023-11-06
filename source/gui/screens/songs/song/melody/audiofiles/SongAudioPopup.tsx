import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, ScrollView } from "react-native";
import { ThemeContextProps, useTheme } from "../../../../../components/ThemeProvider";
import ConfirmationModal from "../../../../../components/popups/ConfirmationModal";
import AudioItem from "./AudioItem";
import { Song, SongAudio } from "../../../../../../logic/db/models/Songs";
import { AudioFiles } from "../../../../../../logic/songs/audiofiles/audiofiles";
import TrackPlayer from "react-native-track-player";
import { ServerAuth } from "../../../../../../logic/server/auth";
import { api } from "../../../../../../logic/api";
import { AbcMelody } from "../../../../../../logic/db/models/AbcMelodies";

interface Props {
  song: Song;
  selectedMelody?: AbcMelody;
  onClose: () => void;
}

const SongAudioPopup: React.FC<Props> = ({ song, selectedMelody, onClose }) => {
  const styles = createStyles(useTheme());
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<SongAudio[]>([]);
  const [selectedItem, setSelectedItem] = useState<SongAudio | undefined>();

  useEffect(() => {
    fetchItems();
  }, []);

  // Set default selection
  useEffect(() => {
    if (items.length == 0) return;

    let defaultItem = items[0];
    if (selectedMelody) {
      defaultItem = items.find(it => it.name == selectedMelody.name) ?? defaultItem;
    }

    setSelectedItem(defaultItem);
  }, [items]);

  const fetchItems = () => {
    setIsLoading(true);
    AudioFiles.fetchAll(song)
      .then(setItems)
      .finally(() => setIsLoading(false));
  };

  const downloadFile = async () => {
    const item = selectedItem;
    if (item === undefined) return;

    const jwt = ServerAuth.getJwt();
    const track = {
      url: api.songs.audio.single(item),
      headers: {
        "Authorization": `Bearer ${jwt}`
      },
      title: song.name + " - " + item.name,
      album: Song.getSongBundle(song)?.name
    };

    await TrackPlayer.reset();
    await TrackPlayer.add(track);
    await TrackPlayer.play();
    onClose();
  };

  return <ConfirmationModal isOpen={true}
                            title={"Select audio file"}
                            confirmText={"Play"}
                            onClose={onClose}
                            onConfirm={selectedItem === undefined ? undefined : downloadFile}
                            showCloseButton={true}>
    <View style={styles.container}>
      <Text style={styles.text}>
        Currently, all audio files come from an online server. Mobile data/WiFi will be used to download the selected
        audio file.
      </Text>

      {!isLoading ? undefined :
        <ActivityIndicator style={styles.loadingIcon}
                           color={styles.loadingIcon.color} />}

      {isLoading ? undefined :
        <ScrollView style={styles.list}>
          {items.length > 0
            ? items.map(it => <AudioItem key={it.uuid}
                                         item={it}
                                         isSelected={selectedItem?.uuid === it.uuid}
                                         onPress={() => setSelectedItem(it)} />)
            : <Text style={styles.text}>There are no audio files for this song, yet.</Text>}
        </ScrollView>
      }
    </View>
  </ConfirmationModal>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    alignSelf: "stretch",
    minWidth: "90%",
    marginRight: -10,
    marginBottom: -30
  },
  text: {
    paddingTop: 10,
    color: colors.text.default
  },
  loadingIcon: {
    color: colors.text.lighter,
    marginTop: 15
  },

  list: {
    marginTop: 10
  }
});

export default SongAudioPopup;
