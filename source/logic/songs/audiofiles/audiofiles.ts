import { Song, SongAudio } from "../../db/models/Songs";
import { Server } from "../../server/server";
import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode } from "react-native-track-player";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";
import Settings from "../../../settings";

export namespace AudioFiles {
  let isInitialized = false;

  export const fetchAll = (song: Song): Promise<SongAudio[]> => {
    return Server.fetchAudioFilesForSong(song);
  };

  export const initPlayer = async () => {
    if (!isInitialized) {
      try {
        isInitialized = await setupPlayer();
      } catch (error) {
        rollbar.error("Failed to init track player", sanitizeErrorForRollbar(error));
      }
    }

    // Do this at every init player, as the setting may have changed
    await TrackPlayer.setRate(Settings.songAudioPlaybackSpeed);
  };

  const setupPlayer = async (): Promise<boolean> => {
    try {
      await TrackPlayer.setupPlayer({
        backBuffer: 120
      });
    } catch (error) {
      if (error instanceof Error && error.message === "The player has already been initialized via setupPlayer.") {
        return true;
      }
      rollbar.error("Failed to setup track player", sanitizeErrorForRollbar(error));
      return false;
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
    return true;
  };
}