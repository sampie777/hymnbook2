import Db from "../db";
import { SongBundle } from "../models/Songs";
import { SongBundleSchema } from "../models/SongsSchema";
import { SongProcessor } from "../../songs/songProcessor";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";

export namespace SongDbPatch {
  /**
   * Loop through all bundles from new to old. If for any bundle a matching
   * bundle is found, which is newer, remove the older bundle.
   */
  const removeDuplicateBundles = () => {
    const approvedBundleUuids: string[] = [];
    const bundles = Db.songs.realm()
      .objects<SongBundle>(SongBundleSchema.name)
      .sorted("id", true);

    bundles.forEach((it, index) => {
      const isDuplicateBundle = approvedBundleUuids.includes(it.uuid);
      if (!isDuplicateBundle) {
        approvedBundleUuids.push(it.uuid);
        return;
      }

      try {
        SongProcessor.deleteSongBundle(it);
      } catch (error) {
        rollbar.warning("Failed to remove older duplicate bundle", {
          ...sanitizeErrorForRollbar(error),
          bundle: it,
          approvedBundleUuids: approvedBundleUuids,
          bundles: bundles.map(it => ({
            id: it.id,
            name: it.name,
            uuid: it.uuid,
            hash: it.hash
          }))
        });
      }
    });
  };

  export const patch = () => {
    removeDuplicateBundles();
  };
}