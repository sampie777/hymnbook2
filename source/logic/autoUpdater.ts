import Settings from "../settings";
import { SongAutoUpdater } from "./songs/updater/songAutoUpdater";
import { rollbar } from "./rollbar";
import { delayed, isIOS, sanitizeErrorForRollbar } from "./utils";
import { DocumentAutoUpdater } from "./documents/updater/documentAutoUpdater";
import { UpdaterContextProps } from "../gui/components/providers/UpdaterContextProvider";
import * as Types from "@react-native-community/netinfo/src/internal/types";

export namespace AutoUpdater {

  export const run = async (context: UpdaterContextProps): Promise<any> => {
    const mayUseNetwork = (): boolean => true;

    if (!mayUseNetwork()) return Promise.resolve();
    if (!isCheckIntervalPassed()) return Promise.resolve();

    // todo: further execution of function disabled for test run 1.17.9. Please enable if 1.17.9 works.
    return Promise.resolve()
    // return Promise.all([
    //   SongAutoUpdater.run(context.addSongBundleUpdating, context.removeSongBundleUpdating, mayUseNetwork)
    //     .catch(error => rollbar.error("Failed to run auto updater for songs", sanitizeErrorForRollbar(error))),
    //
    //   DocumentAutoUpdater.run(context.addDocumentGroupUpdating, context.removeDocumentGroupUpdating, mayUseNetwork)
    //     .catch(error => rollbar.error("Failed to run auto updater for documents", sanitizeErrorForRollbar(error))),
    // ])
  }

  const isCheckIntervalPassed = (): boolean => {
    if (Settings.autoUpdateDatabasesCheckIntervalInDays <= 0) return false;

    const intervalEndTimestamp = Settings.autoUpdateDatabasesLastCheckTimestamp + Settings.autoUpdateDatabasesCheckIntervalInDays * 24 * 3600 * 1000;
    const now = new Date();
    if (now.getTime() < intervalEndTimestamp) {
      console.debug("Next update check:", new Date(intervalEndTimestamp))
      return false;
    }

    // Create check date at start of the day, so every check can be done during any time of the day and is not dependent on the hour of the last check
    const lastCheckDay = new Date();
    lastCheckDay.setHours(0, 0, 0, 0);

    Settings.autoUpdateDatabasesLastCheckTimestamp = lastCheckDay.getTime();
    Settings.store();
    return true;
  }
}