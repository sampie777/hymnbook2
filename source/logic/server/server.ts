import { api } from "../api";
import { throwErrorsIfNotOk } from "../apiUtils";
import { Result } from "../utils";
import { SongBundle } from "./models/ServerSongsModel";
import { rollbar } from "../rollbar";
import { JsonResponse, JsonResponseType } from "./models";

export namespace Server {
  export const fetchSongBundles = (includeOther: boolean = false): Promise<Result<Array<SongBundle>>> => {
    return api.songBundles.list()
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse<SongBundle[]>) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new Error(data.content);
        }

        let bundles = data.content;
        if (!includeOther) {
          bundles = bundles.filter(it => it.name !== "Other");
        }

        return new Result({ success: true, data: bundles });
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

  export const fetchSongBundleWithSongsAndVerses = (bundle: SongBundle): Promise<Result<SongBundle>> => {
    return api.songBundles.getWithSongs(bundle.id, true, true)
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse<SongBundle>) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new Error(data.content);
        }

        return new Result({ success: true, data: data.content });
      })
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
