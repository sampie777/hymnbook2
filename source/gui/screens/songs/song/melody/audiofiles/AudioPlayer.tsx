import React, { useEffect, useState } from "react";
import { SongAudio } from "../../../../../../logic/db/models/Songs";
import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode } from "react-native-track-player";
import { rollbar } from "../../../../../../logic/rollbar";
import { sanitizeErrorForRollbar } from "../../../../../../logic/utils";

interface Props {
  children: React.ReactNode,
  item?: SongAudio | undefined;
}

const AudioPlayer: React.FC<Props> = ({ children, item }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const setupPlayer = async () => {
    if (isInitialized) {
      console.debug("Player is already initialized");
      return;
    }

    try {
      await initPlayer();
    } catch (error) {
      rollbar.error("Failed to init track player", sanitizeErrorForRollbar(error));
    }
  };

  const initPlayer = async () => {
    console.debug("Setting up TrackPlayer");

    try {
      await TrackPlayer.setupPlayer();
    } catch (error) {
      if (error instanceof Error && error.message === "The player has already been initialized via setupPlayer.") {
        return;
      }
      rollbar.error("Failed to setup track player", sanitizeErrorForRollbar(error));
      setIsInitialized(false);
      return;
    }

    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.JumpBackward,
        Capability.Stop
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop
      ],
      progressUpdateEventInterval: 2
    });
    await TrackPlayer.setRepeatMode(RepeatMode.Off);

    setIsInitialized(true);
  };

  useEffect(() => {
    setupPlayer();
  }, []);

  return <>
    {children}
  </>;
};

export default AudioPlayer;
