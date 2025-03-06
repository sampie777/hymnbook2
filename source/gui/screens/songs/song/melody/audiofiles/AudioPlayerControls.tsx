import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../../../../components/providers/ThemeProvider";
import TrackPlayer, {
  Event,
  PlaybackErrorEvent,
  usePlaybackState, useProgress,
  useTrackPlayerEvents
} from "react-native-track-player";
import { State } from "react-native-track-player/src/constants/State";
import { Song } from "../../../../../../logic/db/models/songs/Songs";
import { rollbar } from "../../../../../../logic/rollbar";
import Animated, {
  Easing as ReAnimatedEasing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

interface Props {
  song: Song;
  showMelodySettings: () => void;
}

const AudioPlayerControls: React.FC<Props> = ({ song, showMelodySettings }) => {
  const progressBarUpdateIntervalMs = 250;

  const songUuid = useRef<string | undefined>();
  const [shouldBeVisible, setShouldBeVisible] = useState(false);
  const playerState = usePlaybackState();
  const { position, buffered, duration } = useProgress(progressBarUpdateIntervalMs);
  const progressBarPosition = useSharedValue(0);

  const styles = createStyles(useTheme());
  const progressBarStyle = useAnimatedStyle(() => ({ width: `${progressBarPosition.value}%` }));

  useEffect(() => {
    if (song.uuid === songUuid.current) return;
    songUuid.current = song.uuid;

    stop();
  }, [song.uuid]);

  useEffect(() => {
    checkIfControlsShouldBeVisible();
    return () => {
      stop();
    };
  }, []);

  useEffect(() => {
    progressBarPosition.value = withTiming(position / duration * 100, {
      duration: progressBarUpdateIntervalMs,
      easing: ReAnimatedEasing.linear
    });
  }, [position, duration]);

  useTrackPlayerEvents([
    Event.PlaybackError,
    Event.PlaybackActiveTrackChanged
  ], (event) => {
    if (event.type === Event.PlaybackError) {
      handleError(event);
    } else if (event.type == Event.PlaybackActiveTrackChanged) {
      checkIfControlsShouldBeVisible();
    }
  });

  const handleError = (event: PlaybackErrorEvent) => {
    let message = event.message;
    switch (event.code) {
      case "android-io-bad-http-status":
        message = "Failed to load from the server";
    }
    Alert.alert("Failed to load audio", message);
    rollbar.error("Failed to load audio", {
      event: event,
      customMessage: message,
      song: { ...song, verses: undefined },
      playerState: playerState
    });
  };

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
    <Animated.View style={[
      styles.progressBarPosition,
      progressBarStyle
    ]} />

    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.button}
                        onPress={restart}
                        onLongPress={() => Alert.alert("Restart audio",
                          "Click this button to let the audio play from the beginning.")}
                        accessibilityLabel={"Restart audio"}>
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
                            "Click this button to pause or resume the playing of the audio.")}
                          accessibilityLabel={playerState.state == State.Playing ? "Pause audio" : "Play audio"}>
          <Icon name={playerState.state == State.Playing ? "pause" : "play"}
                style={styles.icon} />
        </TouchableOpacity>
      }

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button}
                          onPress={showMelodySettings}
                          accessibilityLabel={"Audio settings"}>
          <Icon name={"cog"}
                style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}
                          onPress={stop}
                          onLongPress={() => Alert.alert("Close player",
                            "Click this button to stop the audio and close the player.")}
                          accessibilityLabel={"Stop audio"}>
          <Icon name={"times"}
                style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface1,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    alignItems: "stretch",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,

    elevation: 9
  },
  progressBarPosition: {
    backgroundColor: colors.background,
    opacity: 1,
    marginTop: 1,
    height: "100%",
    position: "absolute"
  },

  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  buttonGroup: {
    flexDirection: "row"
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
