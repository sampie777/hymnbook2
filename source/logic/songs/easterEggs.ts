import { Song } from "../db/models/songs/Songs";
import Db from "../db/db";
import { SongSchema } from "../db/models/songs/SongsSchema";
import { SongSearch } from "./songSearch";

export namespace EasterEggs {
  export const findRandomSong = (bundleUuids: string[]): Song | undefined => {
    const allSongs = bundleUuids.length == 0
      ? Db.songs.realm().objects<Song>(SongSchema.name)
      : Db.songs.realm().objects<Song>(SongSchema.name)
        .filtered(SongSearch.createSongBundleFilterQuery(bundleUuids))

    if (allSongs.length == 0) return undefined;

    return allSongs[Math.random() * allSongs.length];
  }
}