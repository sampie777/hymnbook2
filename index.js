/**
 * @format
 */

import 'react-native-gesture-handler';  // First import to prevent crashes in iOS (https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation#ios)
import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";
import App from "./source/App";
import { rollbar, rollbarInit } from "./source/logic/rollbar";
import { sanitizeErrorForRollbar } from "./source/logic/utils";
import { trackPlayerInit } from "./source/logic/songs/audiofiles/playerservice";

AppRegistry.registerRunnable(appName, async initialProps => {
  try {
    await rollbarInit();
  } catch (error) {
    rollbar.error("Failed to initialize rollbar", sanitizeErrorForRollbar(error));
  }

  try {
    AppRegistry.registerComponent(appName, () => App);
    AppRegistry.runApplication(appName, initialProps);

    try {
      const TrackPlayer = require("react-native-track-player").default;
      TrackPlayer.registerPlaybackService(() => trackPlayerInit);
    } catch (error) {
      rollbar.error("Failed to register TrackPlayer", sanitizeErrorForRollbar(error));
    }
  } catch (error) {
    rollbar.error("Failed to run App", sanitizeErrorForRollbar(error));
    throw error;
  }
});