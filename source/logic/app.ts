import { rollbar } from "./rollbar";
import Db from "./db/db";
import Settings from "../settings";
import config from "../config";
import { ThemeContextProps } from "../gui/components/ThemeProvider";

export const closeDatabases = () => {
  Settings.store();
  Db.documents.disconnect();
  Db.songs.disconnect();
  Db.settings.disconnect();
};

export const initSettingsDatabase = (theme?: ThemeContextProps) =>
  Db.settings.connect()
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

      if (Settings.authClientName != null && Settings.authClientName.length > 0) {
        rollbar.setPerson(Settings.authClientName);
      }
    });

export const initSongDatabase = () =>
  Db.songs.connect()
    .catch(e => {
      rollbar.error("Could not connect to local song database: " + e.toString(), e);
      alert("Could not connect to local song database: " + e);
    });

export const initDocumentDatabase = () =>
  Db.documents.connect()
    .catch(e => {
      rollbar.error("Could not connect to local document database: " + e.toString(), e);
      alert("Could not connect to local document database: " + e);
    });

export const deepLinkValidatePath = (url: string): boolean =>
  config.deepLinkPaths.some(path => url.startsWith(path));

export const deepLinkPathToSegments = (url: string): string[] => {
  let trimmedUrl = url.trim();
  // Remove deep link paths from url
  config.deepLinkPaths.forEach(path => trimmedUrl = trimmedUrl.replace(path, ""));
  return trimmedUrl
    .replace(/(^\/+|\/+$)*/g, "")
    .split("/");
};
