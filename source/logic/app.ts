import { Alert } from "react-native";
import { Security } from "./security";
import { rollbar } from "./rollbar";
import Db from "./db/db";
import Settings from "../settings";
import { ThemeContextProps } from "../gui/components/providers/ThemeProvider";
import { sanitizeErrorForRollbar } from "./utils/utils.ts";
import { AudioFiles } from "./songs/audiofiles/audiofiles";
import { SongDbPatch } from "./db/patches/songs";
import { DocumentDbPatch } from "./db/patches/documents";
import { SettingsDbPatch } from "./db/patches/settings/patching";
import { handleConnectionError } from "./db/utils.ts";

export const closeDatabases = () => {
  Settings.store();
  Db.documents.queueDisconnect();
  Db.songs.queueDisconnect();
  Db.settings.queueDisconnect();
};

export const initSettingsDatabase = (theme?: ThemeContextProps) =>
  Db.settings.connect()
    .catch(error => handleConnectionError(Db.settings, error))
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
    .catch(error => handleConnectionError(Db.songs, error))
    .then(SongDbPatch.patch)
    .catch(error => rollbar.error("Could not apply patches to song database", sanitizeErrorForRollbar(error)));

export const initDocumentDatabase = () =>
  Db.documents.connect()
    .catch(error => handleConnectionError(Db.documents, error))
    .then(DocumentDbPatch.patch)
    .catch(error => rollbar.error("Could not apply patches to document database", sanitizeErrorForRollbar(error)));
