import { delayed } from "../../../../utils";
import Db from "../../../db";
import { SongBundle } from "../../../models/songs/Songs";
import { SongBundleSchema } from "../../../models/songs/SongsSchema";
import Settings from "../../../../../settings";

export const patch2_PreFillSettingsSongSearchSelectedSongBundleUuids = () => {
  if (Settings.songStringSearchSelectedBundlesUuids.length > 0 || Settings.songSearchSelectedBundlesUuids.length > 0) {
    // Data already being used
    return
  }

  // Call delayed so we give song database time to initialize
  return delayed(() => {
    const bundles = Db.songs.realm().objects<SongBundle>(SongBundleSchema.name)

    Settings.songSearchSelectedBundlesUuids = bundles.map(it => it.uuid)
    Settings.songStringSearchSelectedBundlesUuids = bundles.map(it => it.uuid)
  }, 500)
}