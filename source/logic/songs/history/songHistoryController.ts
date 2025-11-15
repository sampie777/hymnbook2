import { Song, SongBundle, Verse } from '../../db/models/songs/Songs';
import { SongHistory, SongHistoryAction, } from '../../db/models/songs/SongHistory';
import Db from '../../db/db';
import { SongHistorySchema } from '../../db/models/songs/SongHistorySchema';
import { rollbar } from '../../rollbar';
import { sanitizeErrorForRollbar } from '../../utils/utils.ts';
import { SongListSongModel } from "../../db/models/songs/SongListModel";

export namespace SongHistoryController {
  export const pushVerse = (
    verse: Verse,
    song?: Song,
    viewDurationMs: number = -1,
    action: SongHistoryAction = SongHistoryAction.Unknown,
    songListSong: SongListSongModel | undefined = undefined,
  ) => {
    if (!verse.uuid) {
      return rollbar.error("Can't store verse in history as it has no uuid", {
        verse: {
          ...verse,
          content: undefined,
          abcLyrics: undefined,
          _songs: undefined,
          _song: undefined,
        },
      });
    }

    if (!song) song = Verse.getSong(verse); // This doesn't work for some reason
    if (song == null) {
      return rollbar.error("Can't store verse in history as no song is found", {
        verse: {
          ...verse,
          content: undefined,
          abcLyrics: undefined,
          _songs: undefined,
          _song: undefined,
        },
      });
    }

    if (!song.uuid) {
      return rollbar.error(
        "Can't store verse in history as its song has no uuid",
        {
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
        },
      );
    }

    const bundle = Song.getSongBundle(song);
    if (bundle == null) {
      return rollbar.error(
        "Can't store verse in history as no bundle is found",
        {
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
        },
      );
    }

    if (!bundle.uuid) {
      return rollbar.error(
        "Can't store verse in history as its bundle has no uuid",
        {
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
        },
      );
    }

    const entry = new SongHistory(
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
      songListSong?.id,
    );

    saveToDatabase(entry, verse, song, bundle);
  };

  const saveToDatabase = (
    entry: SongHistory,
    verse?: Verse,
    song?: Song,
    bundle?: SongBundle,
  ) => {
    try {
      Db.songs.realm().write(() => {
        const result = Db.songs.realm().create(SongHistorySchema.name, entry);
        entry.id = result.id;
      });
    } catch (error) {
      rollbar.error('Failed to store song history', {
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

  export const getLastSongListItem = (): SongHistory | undefined => {
    try {
      const lastHistoryItem = Db.songs.realm()
        .objects<SongHistory>(SongHistorySchema.name)
        .filtered('songListItemId != null')
        .sorted('timestamp', true)[0];

      if (lastHistoryItem && lastHistoryItem.songListItemId != null) {
        return lastHistoryItem;
      }
    } catch (error) {
      rollbar.error('Failed to get last song list item from history', sanitizeErrorForRollbar(error));
    }
    return undefined;
  }
}
