import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../../../../components/ThemeProvider";
import TrackPlayer, {
  Event,
  PlaybackErrorEvent,
  usePlaybackState, useProgress,
  useTrackPlayerEvents
} from "react-native-track-player";
import { State } from "react-native-track-player/src/constants/State";
import { Song } from "../../../../../../logic/db/models/Songs";
import { rollbar } from "../../../../../../logic/rollbar";

interface Props {
  song: Song;
}

const AudioPlayerControls: React.FC<Props> = ({ song }) => {
  const songUuid = useRef<string | undefined>();
  const [shouldBeVisible, setShouldBeVisible] = useState(false);
  const playerState = usePlaybackState();
  const { position, buffered, duration } = useProgress();
  const styles = createStyles(useTheme());

  const handleError = (event: PlaybackErrorEvent) => {
    let message = event.message;
    switch (event.code) {
      case "android-io-bad-http-status":
        message = "Failed to load from the server";
    }
    Alert.alert("Error playing audio", message);
  };

  useTrackPlayerEvents([
    Event.PlaybackError,
    Event.PlaybackActiveTrackChanged
  ], (event) => {
    if (event.type === Event.PlaybackError) {
      rollbar.warning("Failed to load track", {
        event: event,
        song: { ...song, verses: undefined },
        playerState: playerState
      });
      handleError(event);
    } else if (event.type == Event.PlaybackActiveTrackChanged) {
      checkIfControlsShouldBeVisible();
    }
  });

  useEffect(() => {
    if (song.uuid === songUuid.current) return;
    songUuid.current = song.uuid;

    stop();
  }, [song.uuid]);

  const restart = () => {
    TrackPlayer.seekTo(0);
  };

  const play = () => {
    if (playerState.state == State.Playing) {
      TrackPlayer.pause();
    } else if (playerState.state == State.Ended) {
      restart();
    } else {
      TrackPlayer.play();
    }
  };

  const stop = async () => {
    await TrackPlayer.reset();
  };

  const checkIfControlsShouldBeVisible = async () => {
    const queue = await TrackPlayer.getQueue();
    setShouldBeVisible(queue.length > 0);
  };

  if (!shouldBeVisible) {
    return null;
  }

  const isLoading = playerState.state == State.Loading || playerState.state == State.Buffering;

  return <View style={styles.container}>
    <View style={[styles.progressBarPosition, { width: position / duration * 100 + "%" }]} />

    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.button}
                        onPress={restart}
                        onLongPress={() => Alert.alert("Restart audio",
                          "Click this button to let the audio play from the beginning.")}>
        <Icon name={"undo"}
              style={styles.icon} />
      </TouchableOpacity>

      {!isLoading ? undefined :
        <ActivityIndicator style={styles.icon}
                           color={styles.icon.color}
                           size={styles.icon.fontSize} />}
      {isLoading ? undefined :
        <TouchableOpacity style={styles.button}
                          onPress={play}
                          onLongPress={() => Alert.alert("Play/pause audio",
                            "Click this button to pause or resume the playing of the audio.")}>
          <Icon name={playerState.state == State.Playing ? "pause" : "play"}
                style={styles.icon} />
        </TouchableOpacity>
      }

      <TouchableOpacity style={styles.button}
                        onPress={stop}
                        onLongPress={() => Alert.alert("Close player",
                          "Click this button to stop the audio and close the player.")}>
        <Icon name={"times"}
              style={styles.icon} />
      </TouchableOpacity>
    </View>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface1,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    alignItems: "stretch"
  },
  progressBarPosition: {
    backgroundColor: colors.surface2,
    height: "100%",
    position: "absolute"
  },

  buttonsContainer: {
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
