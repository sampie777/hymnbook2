import { Song, SongBundle, Verse } from "../../db/models/Songs";
import { SongHistory, SongHistoryAction } from "../../db/models/SongHistory";
import Db from "../../db/db";
import { SongHistorySchema } from "../../db/models/SongHistorySchema";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";

export namespace SongHistoryController {
  export const pushVerse = (
    verse: Verse,
    song?: Song,
    viewDurationMs: number = -1,
    action: SongHistoryAction = SongHistoryAction.Unknown
  ) => {
    if (!song) song = Verse.getSong(verse); // This doesn't work for some reason
    if (song == null) return console.error("Song is null")

    const bundle = Song.getSongBundle(song);
    if (bundle == null) return console.error("Bundle is null");

    const entry: SongHistory = new SongHistory(
      bundle.uuid,
      bundle.name,
      song.uuid,
      song.name,
      verse.uuid,
      verse.name,
      verse.index,
      new Date(),
      viewDurationMs,
      action,
    )

    saveToDatabase(entry, verse, song, bundle);
  }

  const saveToDatabase = (
    entry: SongHistory,
    verse?: Verse,
    song?: Song,
    bundle?: SongBundle
  ) => {
    try {
      Db.songs.realm().write(() => {
        console.debug(entry)
        const result = Db.songs.realm().create(SongHistorySchema.name, entry);
        entry.id = result.id;
      })
    } catch (error) {
      rollbar.error(`Failed to store song history`, {
        ...sanitizeErrorForRollbar(error),
        verse: {
          ...verse,
          content: undefined,
          abcLyrics: undefined,
          _songs: undefined,
          _song: undefined,
        },
        song: {
          ...song,
          verses: undefined,
          abcMelodies: undefined,
          metadata: undefined,
          lastUsedMelody: undefined,
          _songBundles: undefined,
          _songBundle: undefined,
        },
        bundle: { ...bundle, songs: undefined },
      });
    }
  };
}
