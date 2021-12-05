import { rollbar } from "./rollbar";
import Db from "./db/db";
import Settings from "./settings/settings";
import { ThemeContextProps } from "../components/ThemeProvider";

export const initDatabases = (theme?: ThemeContextProps) =>
  initSettingsDatabase(theme)
    .finally(initSongDatabase)
    .finally(initDocumentDatabase);

export const closeDatabases = () => {
  Settings.store();
  Db.songs.disconnect();
  Db.settings.disconnect();
};

export const initSettingsDatabase = (theme?: ThemeContextProps) => Db.settings.connect()
  .catch(e => {
    rollbar.error("Could not connect to local settings database: " + e.toString(), e);
    alert("Could not connect to local settings database: " + e);
  })
  .then(() => Settings.load())
  .catch(e => {
    rollbar.error("Could not load settings from database: " + e.toString(), e);
    alert("Could not load settings from database: " + e);
  })
  .then(() => {
    theme?.reload();
    Settings.appOpenedTimes++;
    Settings.store();
    rollbar.setPerson(Settings.authClientName);
  });

export const initSongDatabase = () => Db.songs.connect()
  .catch(e => {
    rollbar.error("Could not connect to local song database: " + e.toString(), e);
    alert("Could not connect to local song database: " + e);
  });

export const initDocumentDatabase = () => Db.documents.connect()
  .catch(e => {
    rollbar.error("Could not connect to local document database: " + e.toString(), e);
    alert("Could not connect to local document database: " + e);
  });
