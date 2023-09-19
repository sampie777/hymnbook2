/**
 * @format
 */

import "react-native-get-random-values";
import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";
import { rollbar, rollbarInit } from "./source/logic/rollbar";


AppRegistry.registerRunnable(appName, async initialProps => {
  try {
    await rollbarInit();
  } catch (e) {
    console.error("Failed to initialize rollbar", e);
  }

  try {
    const App = require("./source/App").default;
    AppRegistry.registerComponent(appName, () => App);
    AppRegistry.runApplication(appName, initialProps);
  } catch (e) {
    rollbar.error("Failed to run App", {
      error: e,
    });
    throw e;
  }
});