import { SongBundle as ServerSongBundle } from "../../server/models/ServerSongsModel";
import { sanitizeErrorForRollbar } from "../../utils/utils.ts";
import Db from "../../db/db";
import { rollbar } from "../../rollbar";
import { Server } from "../../server/server";
import { SongBundle } from "../../db/models/songs/Songs";
import { SongUpdaterUtils } from "./songUpdaterUtils";

export namespace SongUpdater {
  export const fetchAndSaveSongBundle = (bundle: { uuid: string }): Promise<any> =>
    Server.fetchSongBundleWithSongsAndVerses(bundle)
      .then(saveSongBundleToDatabase);

  const saveSongBundleToDatabase = (bundle: ServerSongBundle) => {
    SongUpdaterUtils.saveServerSongBundleToDatabase(bundle);
  };

  export const fetchAndUpdateSongBundle = (bundle: { uuid: string }): Promise<any> =>
    Server.fetchSongBundleWithSongsAndVerses(bundle)
      .then(updateAndSaveSongBundle);

  const updateAndSaveSongBundle = (bundle: ServerSongBundle) => {
    SongUpdaterUtils.saveServerSongBundleToDatabase(bundle);
  };

  export const updateLocalBundlesWithUuid = (localBundles: SongBundle[], serverBundles: ServerSongBundle[]) => {
    if (serverBundles.length === 0) {
      return;
    }

    localBundles
      .filter(it => it.uuid == "")
      .forEach(it => {
        const serverBundle = serverBundles.find(serverBundle => serverBundle.name == it.name);
        if (serverBundle === undefined) {
          return;
        }

        try {
          Db.songs.realm().write(() => {
            it.uuid = serverBundle.uuid;
          });
        } catch (error) {
          rollbar.error(`Failed to update songbundle with new UUID`, {
            ...sanitizeErrorForRollbar(error),
            localBundle: { ...it, songs: null },
            serverBundle: { ...serverBundle, songs: null }
          });
        }
      });
  };
}