import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../../../../components/ThemeProvider";
import TrackPlayer, { Event, useTrackPlayerEvents } from "react-native-track-player";
import { State } from "react-native-track-player/src/constants/State";
import { Song } from "../../../../../../logic/db/models/Songs";

interface Props {
  song: Song;
}

const AudioPlayerControls: React.FC<Props> = ({ song }) => {
  const songUuid = useRef<string | undefined>();
  const [shouldBeVisible, setShouldBeVisible] = useState(false);
  const [playerState, setPlayerState] = useState<State | undefined>();
  const styles = createStyles(useTheme());

  useTrackPlayerEvents([
    Event.PlaybackState,
    Event.PlaybackError
  ], (event) => {
    if (event.type === Event.PlaybackError) {
      console.warn("An error occurred while playing the current track.");
    }
    if (event.type === Event.PlaybackState) {
      console.debug(event.state);
      setPlayerState(event.state);
    }
  });

  useEffect(() => {
    if (song.uuid === songUuid.current) return;
    songUuid.current = song.uuid;

    stop();
  }, [song.uuid]);

  useEffect(() => {
    checkIfControlsShouldBeVisible();
  }, [playerState, song.uuid]);

  const restart = () => {
    TrackPlayer.seekTo(0);
  };

  const play = () => {
    if (playerState == State.Playing) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  };

  const stop = async () => {
    await TrackPlayer.reset();
    checkIfControlsShouldBeVisible();
  };

  const checkIfControlsShouldBeVisible = async () => {
    const queue = await TrackPlayer.getQueue();
    console.debug(queue);
    setShouldBeVisible(queue.length > 0);
  };

  if (!shouldBeVisible) {
    return null;
  }

  const isLoading = playerState == State.Loading || playerState == State.Buffering;

  return <View style={styles.container}>
    <TouchableOpacity style={styles.button}
                      onPress={restart}>
      <Icon name={"undo"}
            style={styles.icon} />
    </TouchableOpacity>

    {!isLoading ? undefined :
      <ActivityIndicator style={styles.icon}
                         color={styles.icon.color}
                         size={styles.icon.fontSize} />}
    {isLoading ? undefined :
      <TouchableOpacity style={styles.button}
                        onPress={play}>
        <Icon name={playerState == State.Playing ? "pause" : "play"}
              style={styles.icon} />
      </TouchableOpacity>
    }

    <TouchableOpacity style={styles.button}
                      onPress={stop}>
      <Icon name={"times"}
            style={styles.icon} />
    </TouchableOpacity>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface1,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  button: {},
  icon: {
    color: colors.text.lighter,
    fontSize: 22,
    marginVertical: 15,
    marginHorizontal: 20
  }
});

export default AudioPlayerControls;
