import Db from "../db";
import { SongBundle } from "../models/songs/Songs";
import { SongBundleSchema, SongMetadataSchema, SongSchema, VerseSchema } from "../models/songs/SongsSchema";
import { SongProcessor } from "../../songs/songProcessor";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils/utils.ts";
import { AbcMelodySchema } from "../models/songs/AbcMelodiesSchema";
import { removeObjectsWithoutParents } from "./utils";
import { SongListSongModelSchema, SongListVerseModelSchema } from "../models/songs/SongListModelSchema";

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

    bundles.forEach(it => {
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
        { schemaName: SongListSongModelSchema.name, parentLink: '_songList', },
        { schemaName: SongListVerseModelSchema.name, parentLink: '_songListSong', },
      ]);
  }

  export const patch = () => {
    try {
      removeDuplicateBundles();
    } catch (error) {
      rollbar.error("Failed to remove duplicate bundles", sanitizeErrorForRollbar(error));
    }
    try {
      removeSongObjectsWithoutParents();
    } catch (error) {
      rollbar.error("Failed to remove song objects without parents", sanitizeErrorForRollbar(error));
    }
  };
}