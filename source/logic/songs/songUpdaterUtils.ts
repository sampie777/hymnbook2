import {
  Song as ServerSong,
  SongBundle as ServerSongBundle,
  SongVerse as ServerVerse
} from "../server/models/ServerSongsModel";
import { Song, SongBundle, SongMetadata, SongMetadataType, Verse } from "../db/models/Songs";
import Db from "../db/db";
import { SongBundleSchema, SongMetadataSchema, SongSchema, VerseSchema } from "../db/models/SongsSchema";
import { AbcMelodySchema, AbcSubMelodySchema } from "../db/models/AbcMelodiesSchema";
import { AbcMelody, AbcSubMelody } from "../db/models/AbcMelodies";
import { dateFrom, sanitizeErrorForRollbar } from "../utils";
import { rollbar } from "../rollbar";
import config from "../../config";
import { SongProcessor } from "./songProcessor";
import Settings from "../../settings";
import SongList from "./songList";

export namespace SongUpdaterUtils {

  const writeBundleToDatabase = (bundle: SongBundle) => {
    Db.songs.realm().write(() => {
      Db.songs.realm().create(SongBundleSchema.name, bundle);
    });
  };

  /**
   * Some songs have user settings, like lastUsedMelody. Copy the old settings to the new songs so the user won't
   * have to set these settings again. This to provide a seamless update.
   *
   * @param songBundle The newly created song bundle. Used for fetching the bundle from the database by ID
   * and used for error logging context.
   */
  const copyUserSettingsToExistingSongBundles = (songBundle: SongBundle) => {
    const localSongBundle = Db.songs.realm().objectForPrimaryKey<SongBundle>(SongBundleSchema.name, songBundle.id);
    if (!localSongBundle) {
      throw Error("Could not find newly created song bundle in database");
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

  const replaceSongListSongs = (songBundle: SongBundle) => {
    const songList = SongList.list();
    songList.forEach(item => {
      const newSong = songBundle.songs.find(it => it.uuid == item.song.uuid);
      if (newSong == undefined) return;

      try {
        SongList.replaceSong(item, newSong);
      } catch (error) {
        rollbar.error("Failed to replace song list song", {
          item: item,
          newSong: newSong,
        })
      }
    });
  };

  const convertServerSongBundleToLocalSongBundle = (bundle: ServerSongBundle): SongBundle => {
    let songId = Db.songs.getIncrementedPrimaryKey(SongSchema);
    let verseId = Db.songs.getIncrementedPrimaryKey(VerseSchema);
    let melodyId = Db.songs.getIncrementedPrimaryKey(AbcMelodySchema);
    let subMelodyId = Db.songs.getIncrementedPrimaryKey(AbcSubMelodySchema);
    let metadataId = Db.songs.getIncrementedPrimaryKey(SongMetadataSchema);

    const convertVerseWithSubMelodies = (verse: ServerVerse, melodies: AbcMelody[]): Verse => {
      const result = new Verse(
        verse.index,
        verse.name,
        verse.content,
        verse.language,
        verse.uuid,
        verseId++,
        verse.abcLyrics,
        []
      );

      result.abcMelodies = (verse.abcMelodies || [])
        .map(melody => {
          const parent = melodies.find(it => it.uuid == melody.parent.uuid);
          if (parent == null) return null;

          return new AbcSubMelody(
            melody.melody,
            melody.uuid,
            parent.uuid,
            subMelodyId++
          );
        })
        .filter(it => it != null) as AbcSubMelody[];

      return result;
    };

    const convertServerSongToLocalSong = (song: ServerSong): Song => {
      const abcMelodies = (song.abcMelodies || [])
        .sort(SongProcessor.sortSongMelodyByName)
        .map(melody => new AbcMelody(
          melody.name,
          melody.melody,
          melody.uuid,
          melodyId++
        ));

      const verses = (song.verses || [])
        .sort((a, b) => a.index - b.index)
        .map(verse => convertVerseWithSubMelodies(verse, abcMelodies));

      return new Song(
        song.name,
        song.language,
        dateFrom(song.createdAt),
        dateFrom(song.modifiedAt),
        song.uuid,
        verses,
        abcMelodies,
        song.metadata
          ?.sort((a, b) => a.id - b.id)
          ?.filter(it => Object.values(SongMetadataType).includes(it.type))
          ?.map(it => new SongMetadata(it.type, it.value, metadataId++)) || [],
        songId++,
        song.number
      );
    };

    const songs = (bundle.songs || [])
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

  export const saveServerSongBundleToDatabase = (bundle: ServerSongBundle) => {
    if (!Db.songs.isConnected()) {
      rollbar.warning("Cannot update song bundle: song database is not connected", {
        bundle: { ...bundle, songs: null }
      });
      throw Error("Database is not connected");
    }

    if (bundle.songs == null) {
      rollbar.warning("Song bundle contains no songs", { bundle: bundle });
    }

    const existingBundles = [...SongProcessor.getExistingBundle(bundle)];
    const isUpdate = existingBundles.length > 0;
    if (existingBundles.length > 1) {
      rollbar.warning("Multiple existing bundles found for new/to-be-updated song bundle", {
        bundle: { ...bundle, songs: null },
        existingBundleNames: existingBundles.map(it => it.name),
        isUpdate: isUpdate
      });
    }

    const songBundle = convertServerSongBundleToLocalSongBundle(bundle);

    try {
      writeBundleToDatabase(songBundle);
    } catch (error) {
      rollbar.error(`Failed to store song bundle`, {
        ...sanitizeErrorForRollbar(error),
        serverBundle: { ...bundle, songs: null },
        newBundle: { ...songBundle, songs: null },
        isUpdate: isUpdate
      });
      throw Error(`Failed to import songs: ${error}`);
    }

    try {
      copyUserSettingsToExistingSongBundles(songBundle);
    } catch (error) {
      rollbar.error(`Failed to copy user settings to new song bundle`, {
        ...sanitizeErrorForRollbar(error),
        bundle: { ...songBundle, songs: null },
        existingBundleNames: existingBundles.map(it => it.name),
        isUpdate: isUpdate
      });
    }

    try {
      replaceSongListSongs(songBundle);
    } catch (error) {
      rollbar.error(`Failed to replace song list songs with new song bundle`, {
        ...sanitizeErrorForRollbar(error),
        bundle: { ...songBundle, songs: null },
        existingBundleNames: existingBundles.map(it => it.name),
        isUpdate: isUpdate
      });
    }

    const isInSongSearchSelectedBundlesUuids = Settings.songSearchSelectedBundlesUuids.includes(songBundle.uuid);
    const isInSongStringSearchSelectedBundlesUuids = Settings.songStringSearchSelectedBundlesUuids.includes(songBundle.uuid);

    if (existingBundles.length > 0) {
      const deleteResult = SongProcessor.deleteSongBundle(existingBundles[0]);
      if (!deleteResult.success) {
        throw Error(deleteResult.message);
      }
    }

    if (!isUpdate || isInSongSearchSelectedBundlesUuids) Settings.songSearchSelectedBundlesUuids.push(songBundle.uuid);
    if (!isUpdate || isInSongStringSearchSelectedBundlesUuids) Settings.songStringSearchSelectedBundlesUuids.push(songBundle.uuid);
    Settings.store();
  };
}