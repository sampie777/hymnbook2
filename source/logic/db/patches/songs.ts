import Db from "../db";
import { SongBundle } from "../models/Songs";
import { SongBundleSchema, SongMetadataSchema, SongSchema, VerseSchema } from "../models/SongsSchema";
import { SongProcessor } from "../../songs/songProcessor";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";
import { AbcMelodySchema } from "../models/AbcMelodiesSchema";
import { removeObjectsWithoutParents } from "./utils";

export namespace SongDbPatch {
  /**
   * Loop through all bundles from new to old. If for any bundle a matching
   * bundle is found, which is newer, remove the older bundle.
   */
  const removeDuplicateBundles = () => {
    const approvedUuids: string[] = [];
    const bundles = Db.songs.realm()
      .objects<SongBundle>(SongBundleSchema.name)
      .sorted("id", true);

    bundles.forEach((it) => {
      const isDuplicate = approvedUuids.includes(it.uuid);
      if (!isDuplicate) {
        approvedUuids.push(it.uuid);
        return;
      }

      try {
        SongProcessor.deleteSongBundle(it);
      } catch (error) {
        rollbar.warning("Failed to remove older duplicate bundle", {
          ...sanitizeErrorForRollbar(error),
          bundle: it,
          approvedUuids: approvedUuids,
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

  const removeSongObjectsWithoutParents = () => {
    removeObjectsWithoutParents(Db.songs,
      [
        { schemaName: SongSchema.name, parentLink: '_songBundles', },
        { schemaName: SongMetadataSchema.name, parentLink: '_songs', },
        { schemaName: VerseSchema.name, parentLink: '_songs', },
        { schemaName: AbcMelodySchema.name, parentLink: '_song', },
      ]);
  }

  export const patch = () => {
    removeDuplicateBundles();
    removeSongObjectsWithoutParents();
  };
}