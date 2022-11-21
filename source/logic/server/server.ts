import { api } from "../api";
import { throwErrorsIfNotOk } from "../apiUtils";
import { Result } from "../utils";
import { SongBundle } from "./models/ServerSongsModel";
import { rollbar } from "../rollbar";
import { JsonResponse, JsonResponseType } from "./models";
import { ServerAuth } from "./auth";

export namespace Server {
  export const fetchSongBundles = (includeOther: boolean = false): Promise<Result<Array<SongBundle>>> => {
    return api.songBundles.list()
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new Error(data.content);
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

  export const fetchSongBundleWithSongsAndVerses = (bundle: SongBundle, resetAuthOn403: boolean = true): Promise<Result<SongBundle>> => {
    return api.songBundles.getWithSongs(bundle.id, true, true)
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new Error(data.content);
        }

        return new Result({ success: true, data: data.content });
      })
      .catch(error => {
        if (resetAuthOn403 && error.message.includes("Not authorized.")) {
          // Reset authentication to regain new rights
          ServerAuth.forgetCredentials();
          rollbar.info(`Resetting credentials due to HTTP 401/403 error when fetching song bundle (${bundle.name})`);
          return fetchSongBundleWithSongsAndVerses(bundle, false);
        }

        rollbar.error(`Error fetching songs for song bundle ${bundle.name}`, error);
        throw error;
      });
  };
}
