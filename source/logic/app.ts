import { rollbar } from "./rollbar";
import Db from "./db/db";
import Settings from "../settings";
import { ThemeContextProps } from "../gui/components/ThemeProvider";
import { sanitizeErrorForRollbar } from "./utils";

export const closeDatabases = () => {
  Settings.store();
  Db.documents.disconnect();
  Db.songs.disconnect();
  Db.settings.disconnect();
};

export const initSettingsDatabase = (theme?: ThemeContextProps) =>
  Db.settings.connect()
    .catch(error => {
      rollbar.error("Could not connect to local settings database: " + error.toString(), sanitizeErrorForRollbar(error));
      alert("Could not connect to local settings database: " + error);
    })
    .then(() => Settings.load())
    .catch(error => {
      rollbar.error("Could not load settings from database: " + error.toString(), sanitizeErrorForRollbar(error));
      alert("Could not load settings from database: " + error);
    })
    .then(() => {
      theme?.reload();
      Settings.appOpenedTimes++;
      Settings.store();

      if (Settings.authClientName != null && Settings.authClientName.length > 0) {
        rollbar.setPerson(Settings.authClientName);
      }
    });

export const initSongDatabase = () =>
  Db.songs.connect()
    .catch(error => {
      rollbar.error("Could not connect to local song database: " + error.toString(), sanitizeErrorForRollbar(error));
      alert("Could not connect to local song database: " + error);
    });

export const initDocumentDatabase = () =>
  Db.documents.connect()
    .catch(error => {
      rollbar.error("Could not connect to local document database: " + error.toString(), sanitizeErrorForRollbar(error));
      alert("Could not connect to local document database: " + error);
    });
