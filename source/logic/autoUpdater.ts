import Settings from "../settings";
import { SongAutoUpdater } from "./songs/updater/songAutoUpdater";
import { rollbar } from "./rollbar";
import { sanitizeErrorForRollbar } from "./utils";
import { DocumentAutoUpdater } from "./documents/updater/documentAutoUpdater";
import { UpdaterContextProps } from "../gui/components/providers/UpdaterContextProvider";

export namespace AutoUpdater {
  export const run = async (context: UpdaterContextProps): Promise<any> => new Promise(() => {
    if (!isCheckIntervalPassed()) return;

    return Promise.all([
      SongAutoUpdater.run(context.addSongBundleUpdating, context.removeSongBundleUpdating)
        .catch(error => rollbar.error("Failed to run auto updater for songs", sanitizeErrorForRollbar(error))),

      DocumentAutoUpdater.run(context.addDocumentGroupUpdating, context.removeDocumentGroupUpdating)
        .catch(error => rollbar.error("Failed to run auto updater for documents", sanitizeErrorForRollbar(error))),
    ]);
  })

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