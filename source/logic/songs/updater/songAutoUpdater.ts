import { Server } from "../../server/server";
import { SongProcessor } from "../songProcessor";
import { SongUpdater } from "./songUpdater";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";
import Settings from "../../../settings";

export namespace SongAutoUpdater {
  export const run = async () => {
    if (!isCheckIntervalPassed()) return;

    const bundles = SongProcessor.loadLocalSongBundles();
    if (bundles.length == 0) return;

    const updates = await Server.fetchSongBundleUpdates();

    const outdatedBundles = bundles.filter(bundle =>
      updates.some(update => update.uuid === bundle.uuid && update.hash != bundle.hash))

    for (const bundle of outdatedBundles) {
      console.debug(`Auto updating song bundle ${bundle.name}...`)
      try {
        await SongUpdater.fetchAndUpdateSongBundle(bundle)
      } catch (error) {
        rollbar.error("Failed to auto update song bundle", {
          ...sanitizeErrorForRollbar(error),
          bundle: { ...bundle, songs: null },
        })
      }
    }
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