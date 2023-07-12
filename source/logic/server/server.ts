import { api } from "../api";
import { HttpError, throwErrorsIfNotOk } from "../apiUtils";
import { Result } from "../utils";
import { SongBundle } from "./models/ServerSongsModel";
import { rollbar } from "../rollbar";
import { JsonResponse, JsonResponseType } from "./models";

export class BackendError extends Error {
  name = "HttpError";
  responseData?: object;

  constructor(message?: string, responseData?: object) {
    super(message);
    this.responseData = responseData;
  }
}

export namespace Server {
  export const fetchSongBundles = (includeOther: boolean = false): Promise<Result<Array<SongBundle>>> => {
    return api.songBundles.list()
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse<SongBundle[]>) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new BackendError("Server response is of error type", data);
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

  export const fetchSongBundle = (bundle: SongBundle | { uuid: string }, {
    loadSongs = false,
    loadVerses = false,
    loadAbcMelodies = false
  }): Promise<Result<SongBundle>> => {
    return api.songBundles.get(bundle.uuid, loadSongs, loadVerses, loadAbcMelodies)
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse<SongBundle>) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new BackendError("Server response is of error type", data);
        }

        return new Result({ success: true, data: data.content });
      })
      .catch(error => {
        rollbar.error(`Error fetching song bundle`, {
          error: error,
          errorType: error.constructor.name,
          songBundle: bundle,
          loadSongs: loadSongs,
          loadVerses: loadVerses,
          loadAbcMelodies: loadAbcMelodies
        });
        throw error;
      });
  };

  export const fetchSongBundleWithSongsAndVerses = (bundle: SongBundle): Promise<Result<SongBundle>> =>
    fetchSongBundle(bundle, {
      loadSongs: true,
      loadVerses: true,
      loadAbcMelodies: true
    });
}
