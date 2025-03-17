import TrackPlayer, { Event } from "react-native-track-player";

export const trackPlayerInit = async () => {
  try {
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
      // Don't fire up the player when there's nothing to play
      const queue = await TrackPlayer.getQueue();
      if (queue.length == 0) {
        await TrackPlayer.reset()
        return;
      }
      TrackPlayer.play()
    });
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
    TrackPlayer.addEventListener(Event.RemoteJumpBackward, () => TrackPlayer.seekTo(0));
  } catch (error) {
    console.error("Could not register TrackPlayer event listeners", error)
    throw error;
  }
};
