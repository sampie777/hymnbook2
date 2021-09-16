import React from "react";
import { SongListSongModel } from "../../models/SongListModel";
import SongList from "../../scripts/songList/songList";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

const SongListControls: React.FC<{ index: number, goToSongListSong: (songListSong: SongListSongModel) => void }> =
  ({ index, goToSongListSong }) => {
    const previousSong = SongList.previousSong(index);
    const nextSong = SongList.nextSong(index);

    return (<View style={styles.container}>
      {previousSong === undefined ? <View /> :
        <TouchableOpacity style={styles.button}
                          onPress={() => goToSongListSong(previousSong)}>
          <Icon name={"chevron-left"}
                color={styles.buttonText.color}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </TouchableOpacity>}

      {nextSong === undefined ? undefined :
        <TouchableOpacity style={styles.button}
                          onPress={() => goToSongListSong(nextSong)}>
          <Icon name={"chevron-right"}
                color={styles.buttonText.color}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </TouchableOpacity>}
    </View>);
  };

export default SongListControls;

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    width: "100%",
    bottom: 30,
    paddingHorizontal: 20,
  },

  button: {
    backgroundColor: "dodgerblue",
    borderRadius: 23,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    zIndex: 10,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  }
});
