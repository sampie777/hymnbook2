import TrackPlayer, { Event } from "react-native-track-player";

export const trackPlayerInit = async () => {
  try {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  } catch (error) {
    console.error("Could not register TrackPlayer event listeners", error)
    throw error;
  }
};
