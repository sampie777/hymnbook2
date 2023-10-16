import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, ScrollView } from "react-native";
import { ThemeContextProps, useTheme } from "../../../../../components/ThemeProvider";
import ConfirmationModal from "../../../../../components/popups/ConfirmationModal";
import AudioItem from "./AudioItem";
import { Song, SongAudio } from "../../../../../../logic/db/models/Songs";
import { AudioFiles } from "../../../../../../logic/songs/audiofiles/audiofiles";

interface Props {
  song: Song;
  onClose: () => void;
}

const SongAudioPopup: React.FC<Props> = ({ song, onClose }) => {
  const styles = createStyles(useTheme());
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<SongAudio[]>([]);
  const [selectedItem, setSelectedItem] = useState<SongAudio | undefined>();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    setIsLoading(true);
    AudioFiles.fetchAll(song)
      .then(setItems)
      .finally(() => setIsLoading(false));
  };

  const downloadFile = () => {
    onClose();
  }

  return <ConfirmationModal isOpen={true}
                            title={"Audio"}
                            confirmText={"Download"}
                            onClose={onClose}
                            onConfirm={selectedItem === undefined ? undefined : downloadFile}
                            showCloseButton={true}>
    <View style={styles.container}>
      <Text style={styles.text}>
        Currently, all audio files come from an online server. So mobile data/WiFi will be used to download the selected
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
