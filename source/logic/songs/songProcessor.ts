import { rollbar } from "../rollbar";
import Db from "../db/db";
import config from "../../config";
import { Result, sanitizeErrorForRollbar } from "../utils";
import { SongBundle, Verse } from "../db/models/Songs";
import {
  AbcMelody as ServerAbcMelody,
  SongBundle as ServerSongBundle,
} from "../server/models/ServerSongsModel";
import { SongBundleSchema } from "../db/models/SongsSchema";
import { AbcMelody } from "../db/models/AbcMelodies";
import SongList from "./songList";
import Settings from "../../settings";

export namespace SongProcessor {

  export const loadLocalSongBundles = (): Result<(SongBundle & Realm.Object<SongBundle>)[] | undefined> => {
    if (!Db.songs.isConnected()) {
      rollbar.warning("Cannot load local song bundles: song database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    const bundles = Db.songs.realm()
      .objects<SongBundle>(SongBundleSchema.name)
      .sorted(`name`)
      .map(it => it);  // Convert to array. Array.from() will crash tests

    return new Result({ success: true, data: bundles });
  };

  export const getExistingBundle = (bundle: { uuid: string }) => {
    return Db.songs.realm()
      .objects<SongBundle>(SongBundleSchema.name)
      .filtered(`uuid = "${bundle.uuid}"`);
  };

  export const sortSongMelodyByName = (a: (ServerAbcMelody | AbcMelody), b: (ServerAbcMelody | AbcMelody)): number => {
    if (a.name == config.defaultMelodyName) return -1;
    if (b.name == config.defaultMelodyName) return 1;
    if (RegExp("^(Eerste|First)", "").test(a.name)) return -1;
    if (RegExp("^(Eerste|First)", "").test(b.name)) return 1;
    if (RegExp("^(Tweede|Second)", "").test(a.name)) return -1;
    if (RegExp("^(Tweede|Second)", "").test(b.name)) return 1;
    if (RegExp("^(Derde|Third)", "").test(a.name)) return -1;
    if (RegExp("^(Derde|Third)", "").test(b.name)) return 1;
    if (RegExp("^(Vierde|Forth)", "").test(a.name)) return -1;
    if (RegExp("^(Vierde|Forth)", "").test(b.name)) return 1;
    if (RegExp("^(Vyfde|Vijfde|Fifth)", "").test(a.name)) return -1;
    if (RegExp("^(Vyfde|Vijfde|Fifth)", "").test(b.name)) return 1;

    return a.name.localeCompare(b.name);
  };

  export const deleteSongDatabase = (): Promise<Result> => {
    Db.songs.deleteDb();

    return Db.songs.connect()
      .then(_ => new Result({ success: true, message: "Deleted all songs" }))
      .catch(error => {
        rollbar.error("Could not connect to local song database after deletions: " + error?.toString(), {
          ...sanitizeErrorForRollbar(error)
        });
        return new Result({
          success: false,
          message: "Could not reconnect to local database after deletions: " + error
        });
      });
  };

  export const deleteSongBundle = (bundle: SongBundle): Result => {
    if (!Db.songs.isConnected()) {
      rollbar.warning("Cannot delete song bundle: song database is not connected", {
        bundle: { ...bundle, songs: null }
      });
      return new Result({ success: false, message: "Database is not connected" });
    }

    const songCount = bundle.songs.length;
    const bundleName = bundle.name;
    const bundleUuid = bundle.uuid;

    try {
      Db.songs.realm().write(() => {
        Db.songs.realm().delete(bundle.songs);
        Db.songs.realm().delete(bundle);
      });
    } catch (error) {
      rollbar.error("Failed to delete song bundle", {
        ...sanitizeErrorForRollbar(error),
        bundle: { ...bundle, songs: null }
      });
      return new Result({ success: false, message: `Could not delete (outdated) songs for ${bundleName}` });
    }

    SongList.cleanUpAllSongLists();

    Settings.songSearchSelectedBundlesUuids = Settings.songSearchSelectedBundlesUuids.filter(it => it != bundleUuid);
    Settings.songStringSearchSelectedBundlesUuids = Settings.songStringSearchSelectedBundlesUuids.filter(it => it != bundleUuid);
    Settings.store();

    return new Result({ success: true, message: `Deleted all ${songCount} songs for ${bundleName}` });
  };

  export const getAllLanguagesFromBundles = (bundles: (ServerSongBundle | SongBundle)[]) => {
    if (bundles.length === 0) {
      return [];
    }

    const languages: string[] = [];
    bundles.forEach(it => {
      if (!languages.includes(it.language)) {
        languages.push(it.language);
      }
    });

    return languages;
  };

  export const determineDefaultFilterLanguage = (bundles: (ServerSongBundle | SongBundle)[]): string => {
    if (bundles.length === 0) {
      return "";
    }

    const languageCount: Record<string, number> = {};
    bundles.forEach(it => {
      languageCount[it.language] = (languageCount[it.language] || 0) + 1;
    });

    const languageTopList = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1]);
    return languageTopList[0][0];
  };

  export const hasUpdate = (serverBundles: ServerSongBundle[], bundle: SongBundle): boolean => {
    const serverBundle = getMatchingServerBundle(serverBundles, bundle);
    if (serverBundle === undefined) {
      return false;
    }

    return serverBundle.hash != bundle.hash;
  };

  export const getMatchingServerBundle = (serverBundles: ServerSongBundle[], bundle: SongBundle): ServerSongBundle | undefined => {
    return serverBundles.find(it => it.uuid == bundle.uuid);
  };

  export const isBundleLocal = (localBundles: SongBundle[], serverBundle: ServerSongBundle) => {
    return localBundles.some(it => it.uuid == serverBundle.uuid);
  };

  export const verseShortName = (verse: Verse) => verse.name.trim()
    .replace(/verse */gi, "");
}
