import { api, throwErrorsIfNotOk } from "../../api";
import { Result } from "../utils";
import { SongBundle } from "../../models/ServerSongsModel";
import { rollbar } from "../rollbar";

export namespace Server {
  export const fetchSongBundles = (includeOther: boolean = false): Promise<Result> => {
    return api.songBundles.list()
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then(data => {
        if (data.status === "error") {
          throw new Error(data.data);
        }

        let bundles: Array<SongBundle> = data.content;
        if (!includeOther) {
          bundles = bundles.filter(it => it.name !== "Other")
        }

        return new Result({ success: true, data: bundles });
      })
      .catch(error => {
        rollbar.error(`Error fetching song bundles`, error);
        throw error;
      });
  };

  export const fetchSongBundleWithSongsAndVerses = (bundle: SongBundle): Promise<Result> => {
    return api.songBundles.getWithSongs(bundle.id, true)
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then(data => {
        if (data.status === "error") {
          throw new Error(data.data);
        }

        return new Result({ success: true, data: data.content });
      })
      .catch(error => {
        rollbar.error(`Error fetching songs for song bundle ${bundle.name}`, error);
        throw error;
      });
  };
}
