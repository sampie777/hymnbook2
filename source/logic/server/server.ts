import { api } from "../api";
import { rollbar } from "../rollbar";
import { parseJscheduleResponse } from "../apiUtils";
import { SongBundle } from "./models/ServerSongsModel";

export namespace Server {
  export const fetchSongBundles = (includeOther: boolean = false): Promise<SongBundle[]> => {
    return api.songBundles.list()
      .then(r => parseJscheduleResponse<SongBundle[]>(r))
      .then(bundles => {
        if (!includeOther) {
          bundles = bundles.filter(it => it.name !== "Other");
        }

        return bundles;
      })
      .catch(error => {
        rollbar.error(`Error fetching song bundles`, {
          error: error,
          errorType: error.constructor.name,
          includeOther: includeOther
        });
        throw error;
      });
  };

  export const fetchSongBundleWithSongsAndVerses = (bundle: SongBundle): Promise<SongBundle> => {
    return api.songBundles.getWithSongs(bundle.id, true, true)
      .then(r => parseJscheduleResponse<SongBundle>(r))
      .catch(error => {
        rollbar.error(`Error fetching songs for song bundle`, {
          error: error,
          errorType: error.constructor.name,
          songBundle: bundle
        });
        throw error;
      });
  };
}
