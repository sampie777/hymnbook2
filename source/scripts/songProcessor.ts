import { SongBundle as BackendSongBundle } from "../models/ServerSongsModel";
import Db from "./db/db";
import { Song, SongBundle, Verse } from "../models/Songs";
import { dateFrom, Result } from "./utils";
import { SongBundleSchema, SongSchema, VerseSchema } from "../models/SongsSchema";

export namespace SongProcessor {

  export const loadLocalSongBundles = (): Result => {
    if (!Db.songs.isConnected()) {
      console.log("Database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    const bundles = Db.songs.realm()
      .objects<SongBundle>(SongBundleSchema.name)
      .map(it => it as unknown as SongBundle);

    return new Result({ success: true, data: bundles });
  };

  export const saveSongBundleToDatabase = (bundle: BackendSongBundle): Result => {
    if (!Db.songs.isConnected()) {
      console.log("Database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    if (bundle.songs == null) {
      console.warn("Song bundle contains no songs");
      return new Result({ success: false, message: "Song bundle contains no songs" });
    }

    const existingBundle = Db.songs.realm()
      .objects(SongBundleSchema.name)
      .filtered(`name = "${bundle.name}"`);
    if (existingBundle.length > 0) {
      return new Result({ success: false, message: `Bundle ${bundle.name} already exists` });
    }

    let songId = Db.songs.getIncrementedPrimaryKey(SongSchema);
    let verseId = Db.songs.getIncrementedPrimaryKey(VerseSchema);
    let songs = bundle.songs
      .sort((a, b) => a.id - b.id)
      .map(song =>
        new Song(
          song.name,
          song.author,
          song.copyright,
          song.language,
          dateFrom(song.createdAt),
          dateFrom(song.modifiedAt),
          song.verses
            ?.map(verse => new Verse(
              verse.index,
              verse.name,
              verse.content,
              verse.language,
              verseId++
            )),
          songId++
        )
      );

    const songBundle = new SongBundle(
      bundle.abbreviation,
      bundle.name,
      bundle.language,
      dateFrom(bundle.createdAt),
      dateFrom(bundle.modifiedAt),
      songs
    );

    console.log("Saving to database.");
    try {
      Db.songs.realm().write(() => {
        Db.songs.realm().create(SongBundleSchema.name, songBundle);
      });
    } catch (e) {
      console.error(e);
      return new Result({ success: false, message: `Failed to import songs: ${e}`, error: e as Error });
    }

    console.log(`Created ${songs.length} songs`);
    return new Result({ success: true, message: `${songs.length} songs added!` });
  };

  export const deleteSongDatabase = (): Result => {
    if (!Db.songs.isConnected()) {
      console.log("Database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    console.log("Deleting database");
    Db.songs.deleteDb();

    Db.songs.connect()
      .catch(e => {
        console.error("Could not connect to local database after deletions", e);
        return new Result({ success: false, message: "Could not reconnect to local database after deletions: " + e });
      });

    return new Result({ success: true, message: "Deleted all songs" });
  };

  export const deleteSongBundle = (bundle: SongBundle): Result => {
    if (!Db.songs.isConnected()) {
      console.log("Database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    const songCount = bundle.songs.length;
    const bundleName = bundle.name;

    Db.songs.realm().write(() => {
      console.log("Deleting songs for song bundle: " + bundle.name);
      Db.songs.realm().delete(bundle.songs);

      console.log("Deleting song bundle: " + bundle.name);
      Db.songs.realm().delete(bundle);
    });

    return new Result({ success: true, message: `Deleted all ${songCount} songs for ${bundleName}` });
  };
}
