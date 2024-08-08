import { Alert } from "react-native";
import { Security } from "./security";
import { rollbar } from "./rollbar";
import Db from "./db/db";
import Settings from "../settings";
import { ThemeContextProps } from "../gui/components/providers/ThemeProvider";
import { sanitizeErrorForRollbar } from "./utils";
import { AudioFiles } from "./songs/audiofiles/audiofiles";
import { SongDbPatch } from "./db/patches/songs";
import { DocumentDbPatch } from "./db/patches/documents";
import { SettingsDbPatch } from "./db/patches/settings/patching";

export const closeDatabases = () => {
  Settings.store();
  Db.documents.queueDisconnect();
  Db.songs.queueDisconnect();
  Db.settings.queueDisconnect();
};

export const initSettingsDatabase = (theme?: ThemeContextProps) =>
  Db.settings.connect()
    .catch(error => {
      rollbar.error("Could not connect to local settings database: " + error.toString(), sanitizeErrorForRollbar(error));
      Alert.alert("Could not connect to local settings database: " + error);
    })

    .then(() => Settings.load())
    .catch(error => {
      rollbar.error("Could not load settings from database: " + error.toString(), sanitizeErrorForRollbar(error));
      Alert.alert("Could not load settings from database: " + error);
    })

    .then(SettingsDbPatch.patch)
    .catch(error => rollbar.error("Could not apply patches to settings database", sanitizeErrorForRollbar(error)))

    .then(() => {
      theme?.reload();
      Settings.appOpenedTimes++;
      Settings.store();

      // Set rollbar person if not yet set due to some reason, but was previously known
      if (Security.getDeviceId().length === 0
        && Settings.authClientName != null && Settings.authClientName.length > 0) {
        rollbar.setPerson(Settings.authClientName);
      }

      AudioFiles.initPlayer();
    });

export const initSongDatabase = () =>
  Db.songs.connect()
    .catch(error => {
      rollbar.error("Could not connect to local song database: " + error.toString(), sanitizeErrorForRollbar(error));
      Alert.alert("Could not connect to local song database: " + error);
    })
    .then(SongDbPatch.patch)
    .catch(error => rollbar.error("Could not apply patches to song database", sanitizeErrorForRollbar(error)));

export const initDocumentDatabase = () =>
  Db.documents.connect()
    .catch(error => {
      rollbar.error("Could not connect to local document database: " + error.toString(), sanitizeErrorForRollbar(error));
      Alert.alert("Could not connect to local document database: " + error);
    })
    .then(DocumentDbPatch.patch)
    .catch(error => rollbar.error("Could not apply patches to document database", sanitizeErrorForRollbar(error)));
