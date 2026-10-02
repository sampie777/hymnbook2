import { api, DownloadProgress } from "../api";
import { rollbar } from "../rollbar";
import { parseJscheduleResponse, throwIfConnectionError } from "../apiUtils";
import { ServerSongBundleUpdateStatus, SongBundle } from "./models/ServerSongsModel";
import { sanitizeErrorForRollbar } from "../utils/utils.ts";
import { Song, SongAudio } from "../db/models/songs/Songs";

export namespace Server {
  const songBundlesCache: Map<string, SongBundle> = new Map();

  export const getCachedSongBundle = (uuid: string): SongBundle | undefined => {
    return songBundlesCache.get(uuid);
  };

  export const setSongBundlesCache = (bundles: SongBundle[]) => {
    bundles.forEach(it => {
      if (it.uuid) songBundlesCache.set(it.uuid, it);
    });
  };

  export const clearSongBundlesCache = () => {
    songBundlesCache.clear();
  };

  export const fetchSongBundles = (includeOther: boolean = false): Promise<SongBundle[]> => {
    return api.songBundles.list()
      .then(r => parseJscheduleResponse<SongBundle[]>(r))
      .then(bundles => {
        if (!includeOther) {
          bundles = bundles.filter(it => it.name !== "Other");
        }

        setSongBundlesCache(bundles);
        return bundles;
      })
      .catch(error => {
        throwIfConnectionError(error);

        rollbar.error(`Error fetching song bundles`, {
          ...sanitizeErrorForRollbar(error),
          includeOther: includeOther
        });
        throw error;
      });
  };

  export const fetchSongBundleUpdates = (): Promise<ServerSongBundleUpdateStatus[]> =>
    api.songBundles.updates()
      .then(r => parseJscheduleResponse<ServerSongBundleUpdateStatus[]>(r))
      .catch(error => {
        throwIfConnectionError(error);

        rollbar.error(`Error fetching song bundle update status`, {
          ...sanitizeErrorForRollbar(error),
        });
        throw error;
      });

  export const fetchSongBundle = (bundle: { uuid: string }, {
    loadSongs = false,
    loadVerses = false,
    loadAbcMelodies = false
  }): Promise<SongBundle> => {
    if (!loadSongs && !loadVerses && !loadAbcMelodies) {
      const cached = songBundlesCache.get(bundle.uuid);
      if (cached) {
        return Promise.resolve(cached);
      }
    }

    return api.songBundles.get(bundle.uuid, loadSongs, loadVerses, loadAbcMelodies)
      .then(r => parseJscheduleResponse<SongBundle>(r))
      .then(result => {
        if (result && result.uuid) {
          songBundlesCache.set(result.uuid, result);
        }
        return result;
      })
      .catch(error => {
        throwIfConnectionError(error);

        rollbar.error(`Error fetching song bundle`, {
          ...sanitizeErrorForRollbar(error),
          songBundle: bundle,
          loadSongs: loadSongs,
          loadVerses: loadVerses,
          loadAbcMelodies: loadAbcMelodies
        });
        throw error;
      });
  };

  export const fetchSongBundleWithSongsAndVerses = (bundle: { uuid: string }): Promise<SongBundle> =>
    fetchSongBundle(bundle, {
      loadSongs: true,
      loadVerses: true,
      loadAbcMelodies: true
    });

  export const downloadSongBundleWithProgress = (
    bundle: { uuid?: string; id?: number },
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<SongBundle> => {
    const idOrUuid = bundle.uuid || bundle.id;
    if (!idOrUuid) {
      return Promise.reject(new Error("Cannot download song bundle without uuid or id"));
    }

    return api.songBundles.download(idOrUuid, onProgress)
      .then(result => {
        if (result && result.uuid) {
          songBundlesCache.set(result.uuid, result);
        }
        return result;
      })
      .catch(error => {
        throwIfConnectionError(error);

        rollbar.warning("Download endpoint failed, falling back to standard bundle fetch", {
          ...sanitizeErrorForRollbar(error),
          songBundle: bundle,
        });

        return fetchSongBundleWithSongsAndVerses({ uuid: bundle.uuid || String(bundle.id) });
      });
  };

  export const fetchAudioFilesForSong = (song: Song): Promise<SongAudio[]> =>
    api.songs.audio.all(song)
      .then(r => parseJscheduleResponse<SongAudio[]>(r))
      .catch(error => {
        throwIfConnectionError(error);

        rollbar.error(`Error fetching audio files for song`, {
          ...sanitizeErrorForRollbar(error),
          song: { ...song, verses: null },
        });
        throw error;
      });
}
