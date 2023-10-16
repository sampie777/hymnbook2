/**
 * @format
 */

import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";
import { rollbar, rollbarInit } from "./source/logic/rollbar";
import { trackPlayerInit } from "./source/logic/songs/audiofiles/playerservice";

AppRegistry.registerRunnable(appName, async initialProps => {
  try {
    await rollbarInit();
  } catch (e) {
    rollbar.error("Failed to initialize rollbar", e);
  }

  try {
    const App = require("./source/App").default;
    AppRegistry.registerComponent(appName, () => App);
    AppRegistry.runApplication(appName, initialProps);

    const TrackPlayer = require("react-native-track-player").default;
    TrackPlayer.registerPlaybackService(() => trackPlayerInit);
  } catch (e) {
    rollbar.error("Failed to run App", {
      error: e,
    });
    throw e;
  }
});