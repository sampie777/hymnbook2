import { Server } from "../../server/server";
import { SongProcessor } from "../songProcessor";
import { SongUpdater } from "./songUpdater";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";
import { SongBundle } from "../../db/models/Songs";

export namespace SongAutoUpdater {
  export const run = async (
    addSongBundleUpdating: (bundle: { uuid: string }) => void,
    removeSongBundleUpdating: (bundle: { uuid: string }) => void,
    mayUseNetwork: () => boolean
  ) => {
    const bundles = SongProcessor.loadLocalSongBundles();
    if (bundles.length == 0) return;

    const updates = await Server.fetchSongBundleUpdates();

    for (const bundle of bundles) {
      if (!mayUseNetwork()) continue;

      // Check if bundle hasn't been deleted in the meantime
      if (!bundle.isValid()) continue;

      const hasUpdate = updates.some(update => update.uuid === bundle.uuid && update.hash != bundle.hash);
      if (!hasUpdate) continue;

      // Clone the bundle, as we're going to still need this object
      // after it has been deleted from the database during the update
      const clonedBundle = SongBundle.clone(bundle);

      console.debug(`Auto updating song bundle ${clonedBundle.name}...`)
      addSongBundleUpdating(clonedBundle);

      try {
        await SongUpdater.fetchAndUpdateSongBundle(clonedBundle)
      } catch (error) {
        rollbar.error("Failed to auto update song bundle", {
          ...sanitizeErrorForRollbar(error),
          bundle: clonedBundle,
        })
      } finally {
        removeSongBundleUpdating(clonedBundle);
      }
    }
  }
}