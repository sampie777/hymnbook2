import { api, throwErrorsIfNotOk } from "../../api";
import { Result } from "../utils";
import { SongBundle } from "../../models/ServerSongsModel";

export namespace Server {
  export const fetchSongBundles = (): Promise<Result> => {
    return api.songBundles.list()
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then(data => {
        if (data.status === "error") {
          throw new Error(data.data);
        }

        return new Result({ success: true, data: data.content });
      })
      .catch(error => {
        console.error(`Error fetching song bundles`, error);
        throw error;
      });
  };

  export const fetchSongBundleWithSongsAndVerses = (bundle: SongBundle): Promise<Result> => {
    console.log("Downloading song bundle: " + bundle.name);
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
        console.error(`Error fetching songs for song bundle ${bundle.name}`, error);
        throw error;
      });
  };
}
