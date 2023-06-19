import { rollbar } from "../rollbar";
import Db from "../db/db";
import config from "../../config";
import { dateFrom, Result } from "../utils";
import { Song, SongBundle, SongMetadata, SongMetadataType, Verse } from "../db/models/Songs";
import {
  SongBundle as ServerSongBundle,
  Song as ServerSong,
  SongVerse as ServerVerse,
  AbcMelody as ServerAbcMelody
} from "../server/models/ServerSongsModel";
import { SongBundleSchema, SongMetadataSchema, SongSchema, VerseSchema } from "../db/models/SongsSchema";
import { AbcMelody, AbcSubMelody } from "../db/models/AbcMelodies";
import { AbcMelodySchema, AbcSubMelodySchema } from "../db/models/AbcMelodiesSchema";
import SongList from "./songList";
import { Server } from "../server/server";

export namespace SongProcessor {

  export const loadLocalSongBundles = (): Result<Array<SongBundle & Realm.Object> | undefined> => {
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

  export const saveSongBundleToDatabase = (bundle: ServerSongBundle): Result => {
    if (!Db.songs.isConnected()) {
      rollbar.warning("Cannot save local song bundle to database: song database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    if (bundle.songs == null) {
      rollbar.warning("Song bundle contains no songs", {
        bundle: bundle
      });
      return new Result({ success: false, message: "Song bundle contains no songs" });
    }

    const existingBundle = Db.songs.realm()
      .objects<SongBundle>(SongBundleSchema.name)
      .filtered(`uuid = "${bundle.uuid}"`);
    if (existingBundle.length > 0) {
      rollbar.warning("New song bundle already exists locally", {
        bundle: { ...bundle, songs: null },
        existingBundleNames: existingBundle.map(it => it.name)
      });
      return new Result({ success: false, message: `Bundle ${bundle.name} already exists` });
    }

    const songBundle = convertServerSongBundleToLocalSongBundle(bundle);

    try {
      Db.songs.realm().write(() => {
        Db.songs.realm().create(SongBundleSchema.name, songBundle);
      });
    } catch (e: any) {
      rollbar.error(`Failed to import songs: ${e}`, {
        error: e,
        serverBundle: { ...bundle, songs: null },
        newBundle: { ...songBundle, songs: null }
      });
      return new Result({ success: false, message: `Failed to import songs: ${e}`, error: e as Error });
    }

    return new Result({ success: true, message: `${bundle.name} added!` });
  };

  export const fetchAndUpdateSongBundle = (bundle: ServerSongBundle): Promise<Result> => {
    return Server.fetchSongBundleWithSongsAndVerses(bundle)
      .then((result: Result) => updateAndSaveSongBundle(result.data));
  };

  const updateAndSaveSongBundle = (bundle: ServerSongBundle): Result => {
    if (!Db.songs.isConnected()) {
      rollbar.warning("Cannot update song bundle: song database is not connected", {
        bundle: { ...bundle, songs: null }
      });
      return new Result({ success: false, message: "Database is not connected" });
    }

    if (bundle.songs == null) {
      rollbar.warning("Song bundle contains no songs", { bundle: bundle });
      return new Result({
        success: false,
        message: "New song bundle contains no songs. If this is correct, please manually remove this song bundle."
      });
    }

    const songBundle = convertServerSongBundleToLocalSongBundle(bundle);

    const existingBundle = Db.songs.realm()
      .objects<SongBundle>(SongBundleSchema.name)
      .filtered(`uuid = "${bundle.uuid}"`);
    if (existingBundle.length === 0) {
      rollbar.warning("To-be-updated song bundle doesn't exists locally", {
        bundle: { ...bundle, songs: null }
      });
    } else if (existingBundle.length > 1) {
      rollbar.warning("Multiple existing bundles found for to-be-updated song bundle", {
        bundle: { ...bundle, songs: null },
        existingBundleNames: existingBundle.map(it => it.name)
      });
    }

    try {
      Db.songs.realm().write(() => {
        Db.songs.realm().create(SongBundleSchema.name, songBundle);
      });
    } catch (e: any) {
      rollbar.error(`Failed to save new song bundle`, {
        error: e,
        serverBundle: { ...bundle, songs: null },
        newBundle: { ...songBundle, songs: null }
      });
      return new Result({ success: false, message: `Failed to update songs: ${e}`, error: e as Error });
    }

    if (existingBundle.length > 0) {
      try {
        copyUserSettingsToExistingSongBundles(songBundle);
      } catch (e: any) {
        rollbar.error(`Failed to copy user settings to new song bundle`, {
          error: e,
          bundle: { ...songBundle, songs: null }
        });
      }
    }

    if (existingBundle.length > 0) {
      const deleteResult = deleteSongBundle(existingBundle[0]);
      if (!deleteResult.success) {
        return deleteResult;
      }
    }

    return new Result({ success: true, message: `${bundle.name} updated!` });
  };

  /**
   * Some songs have user settings, like lastUsedMelody. Copy the old settings to the new songs so the user won't
   * have to set these settings again. This to provide a seamless update.
   *
   * @param songBundle The newly created song bundle. Used for fetching the bundle from the database by ID
   * and used for error logging context.
   */
  export const copyUserSettingsToExistingSongBundles = (songBundle: SongBundle) => {
    const localSongBundle = Db.songs.realm().objectForPrimaryKey<SongBundle>(SongBundleSchema.name, songBundle.id);
    if (!localSongBundle) {
      rollbar.error("Could not find newly created song bundle in database", {
        bundle: { ...songBundle, songs: null }
      });
      return;
    }

    localSongBundle.songs.forEach(song => {
      const existingSong = Db.songs.realm()
        .objects<Song>(SongSchema.name)
        .filtered(`id != ${song.id} AND uuid = "${song.uuid}"`);
      if (existingSong.length === 0) return;

      const lastUsedMelody = existingSong[0].lastUsedMelody;
      if (!lastUsedMelody || lastUsedMelody.name == config.defaultMelodyName) return;

      const newMelody = song.abcMelodies.find(it => it.uuid == lastUsedMelody.uuid);
      if (!newMelody) return;

      Db.songs.realm().write(() => {
        song.lastUsedMelody = newMelody;
      });
    });
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

  export const convertServerSongBundleToLocalSongBundle = (bundle: ServerSongBundle): SongBundle => {
    let songId = Db.songs.getIncrementedPrimaryKey(SongSchema);
    let verseId = Db.songs.getIncrementedPrimaryKey(VerseSchema);
    let melodyId = Db.songs.getIncrementedPrimaryKey(AbcMelodySchema);
    let subMelodyId = Db.songs.getIncrementedPrimaryKey(AbcSubMelodySchema);
    let metadataId = Db.songs.getIncrementedPrimaryKey(SongMetadataSchema);

    const getSubMelodiesFromVerses = (verses: ServerVerse[], newVerses: Verse[], parentMelody: ServerAbcMelody): AbcSubMelody[] => {
      return verses.map(verse => {
        const subMelody = verse.abcMelodies?.find(it => it.parentId === parentMelody.id);
        if (subMelody == null) {
          return null;
        }

        const newVerse = newVerses.find(it => it.index == verse.index);
        if (newVerse == null) {
          return null;
        }

        return new AbcSubMelody(
          subMelody.melody,
          newVerse,
          subMelody.uuid,
          subMelodyId++
        );
      })
        .filter(it => it != null) as AbcSubMelody[];
    };

    const convertServerSongToLocalSong = (song: ServerSong): Song => {
      const newSong = new Song(
        song.name,
        song.language,
        dateFrom(song.createdAt),
        dateFrom(song.modifiedAt),
        song.uuid,
        song.verses
          ?.sort((a, b) => a.index - b.index)
          ?.map(verse => new Verse(
            verse.index,
            verse.name,
            verse.content,
            verse.language,
            verse.uuid,
            verseId++,
            verse.abcLyrics
          )) || [],
        [],
        song.metadata
          ?.sort((a, b) => a.id - b.id)
          ?.filter(it => Object.values(SongMetadataType).includes(it.type))
          ?.map(it => new SongMetadata(it.type, it.value, metadataId++)) || [],
        songId++,
        song.number
      );

      // Convert melodies. Also convert sub melodies by getting these from the verses and assigning them
      // to the melody as sub melodies (each with a reference to its verse)
      try {
        newSong.abcMelodies = (song.abcMelodies || [])
          .sort(sortSongMelodyByName)
          .map(melody => new AbcMelody(
            melody.name,
            melody.melody,
            melody.uuid,
            getSubMelodiesFromVerses(song.verses || [], newSong.verses, melody),
            melodyId++
          ));
      } catch (e: any) {
        rollbar.error(`Failed to convert abc melodies to local objects: ${e}`, {
          error: e,
          song: song,
          melodies: song.abcMelodies
        });
      }

      return newSong;
    };

    let songs = (bundle.songs || [])
      .sort((a, b) => a.id - b.id)
      .map(convertServerSongToLocalSong);

    return new SongBundle(
      bundle.abbreviation,
      bundle.name,
      bundle.language,
      bundle.author,
      bundle.copyright,
      dateFrom(bundle.createdAt),
      dateFrom(bundle.modifiedAt),
      bundle.uuid,
      bundle.hash,
      songs
    );
  };

  export const deleteSongDatabase = (): Promise<Result> => {
    Db.songs.deleteDb();

    return Db.songs.connect()
      .then(_ => new Result({ success: true, message: "Deleted all songs" }))
      .catch(e => {
        rollbar.error("Could not connect to local song database after deletions: " + e?.toString(), {
          error: e
        });
        return new Result({ success: false, message: "Could not reconnect to local database after deletions: " + e });
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

    try {
      Db.songs.realm().write(() => {
        Db.songs.realm().delete(bundle.songs);
        Db.songs.realm().delete(bundle);
      });
    } catch (e: any) {
      rollbar.error("Failed to delete song bundle", {
        error: e,
        bundle: { ...bundle, songs: null }
      });
      return new Result({ success: false, message: `Could not delete (outdated) songs for ${bundleName}` });
    }

    SongList.cleanUpAllSongLists();

    return new Result({ success: true, message: `Deleted all ${songCount} songs for ${bundleName}` });
  };

  export const getAllLanguagesFromBundles = (bundles: Array<ServerSongBundle | SongBundle>) => {
    if (bundles.length === 0) {
      return [];
    }

    const languages: Array<string> = [];
    bundles.forEach(it => {
      if (!languages.includes(it.language)) {
        languages.push(it.language);
      }
    });

    return languages;
  };

  export const determineDefaultFilterLanguage = (bundles: Array<ServerSongBundle | SongBundle>): string => {
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
        } catch (e: any) {
          rollbar.error(`Failed to update songbundle ${it.name} with new UUID: ${e}`, {
            error: e,
            localBundle: { ...it, songs: null },
            serverBundle: { ...serverBundle, songs: null }
          });
        }
      });
  };

  export const verseShortName = (verse: Verse) => verse.name.trim()
    .replace(/verse */gi, "");
}
