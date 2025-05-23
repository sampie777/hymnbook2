import { api } from "../api";
import { rollbar } from "../rollbar";
import { parseJscheduleResponse, throwIfConnectionError } from "../apiUtils";
import { ServerSongBundleUpdateStatus, SongBundle } from "./models/ServerSongsModel";
import { sanitizeErrorForRollbar } from "../utils";
import { Song, SongAudio } from "../db/models/songs/Songs";

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
    return api.songBundles.get(bundle.uuid, loadSongs, loadVerses, loadAbcMelodies)
      .then(r => parseJscheduleResponse<SongBundle>(r))
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
