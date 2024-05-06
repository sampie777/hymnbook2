/**
 * @format
 */

import "react-native-gesture-handler";  // First import to prevent crashes in iOS (https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation#ios)
import { AppRegistry } from "react-native";
import { sanitizeErrorForRollbar } from "./source/logic/utils";
import { rollbar, rollbarInit } from "./source/logic/rollbar";
import { trackPlayerInit } from "./source/logic/songs/audiofiles/playerservice";
import App from "./source/App";
import { name as appName } from "./app.json";

try {
  rollbarInit();
} catch (error) {
  rollbar.error("Failed to initialize rollbar", sanitizeErrorForRollbar(error));
}

try {
  AppRegistry.registerComponent(appName, () => App);
} catch (error) {
  rollbar.error("Failed to register app", sanitizeErrorForRollbar(error));
}

try {
  const TrackPlayer = require("react-native-track-player").default;
  TrackPlayer.registerPlaybackService(() => trackPlayerInit);
} catch (error) {
  rollbar.error("Failed to register TrackPlayer", sanitizeErrorForRollbar(error));
}