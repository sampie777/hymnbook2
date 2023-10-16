import React, { createContext, useEffect } from "react";
import { SongAudio } from "../../../../../../logic/db/models/Songs";
import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode } from "react-native-track-player";
import { rollbar } from "../../../../../../logic/rollbar";
import { sanitizeErrorForRollbar } from "../../../../../../logic/utils";

interface Props {
  children: React.ReactNode,
  item?: SongAudio | undefined;
}

const AudioPlayer: React.FC<Props> = ({ children, item }) => {
  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SeekTo
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause
        ]
      });
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
    } catch (error) {
      rollbar.error("Failed to setup track player", sanitizeErrorForRollbar(error));
    }
  };

  useEffect(() => {
    setupPlayer();
  }, []);

  return <>
    {children}
  </>;
};

export default AudioPlayer;
