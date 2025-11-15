import { Song, SongBundle, SongMetadata, Verse } from "../db/models/songs/Songs";
import Db from "../db/db";
import { SongListModel, SongListSongModel, SongListVerseModel } from "../db/models/songs/SongListModel";
import { AbcMelody, AbcSubMelody } from "../db/models/songs/AbcMelodies";
import { rollbar } from "../rollbar";
import { sanitizeErrorForRollbar } from "../utils/utils.ts";

export namespace SongDbHelpers {
  export const deleteAbcSubMelody = (obj: AbcSubMelody) => {
    try {
      Db.songs.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB AbcSubMelody", {
        ...sanitizeErrorForRollbar(error),
        obj: { ...obj }
      });
      throw error;
    }
  }

  export const deleteAbcMelody = (obj: AbcMelody) => {
    for (const child of obj.subMelodies) deleteAbcSubMelody(child);
    try {
      Db.songs.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB AbcMelody", {
        ...sanitizeErrorForRollbar(error),
        obj: { ...obj, subMelodies: null, }
      });
      throw error;
    }
  }

  export const deleteVerse = (obj: Verse) => {
    try {
      Db.songs.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB Verse", {
        ...sanitizeErrorForRollbar(error),
        obj: { ...obj }
      });
      throw error;
    }
  }

  export const deleteSongMetadata = (obj: SongMetadata) => {
    try {
      Db.songs.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB SongMetadata", {
        ...sanitizeErrorForRollbar(error),
        obj: { ...obj }
      });
      throw error;
    }
  }

  export const deleteSong = (obj: Song) => {
    for (const child of obj.verses) deleteVerse(child);
    for (const child of obj.metadata) deleteSongMetadata(child);
    for (const child of obj.abcMelodies) deleteAbcMelody(child);
    try {
      Db.songs.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB Song", {
        ...sanitizeErrorForRollbar(error),
        obj: {
          ...obj,
          verses: null,
          abcMelodies: null,
          metadata: null,
          _songBundles: null,
          _songBundle: null,
        }
      });
      throw error;
    }
  }

  export const deleteSongBundle = (obj: SongBundle) => {
    for (const child of obj.songs) deleteSong(child);
    try {
      Db.songs.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB SongBundle", {
        ...sanitizeErrorForRollbar(error),
        obj: { ...obj, songs: null, }
      });
      throw error;
    }
  }

  export const deleteSongListVerse = (obj: SongListVerseModel) => {
    try {
      Db.songs.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB SongListVerseModel", {
        ...sanitizeErrorForRollbar(error),
        obj: { ...obj }
      });
      throw error;
    }
  }

  export const deleteSongListSong = (obj: SongListSongModel) => {
    for (const child of obj.selectedVerses) deleteSongListVerse(child);
    try {
      Db.songs.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB SongListSongModel", {
        ...sanitizeErrorForRollbar(error),
        obj: {
          ...obj,
          song: null,
          selectedVerses: null,
        }
      });
      throw error;
    }
  }

  export const deleteSongList = (obj: SongListModel) => {
    for (const child of obj.songs) deleteSongListSong(child);
    try {
      Db.songs.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB SongListModel", {
        ...sanitizeErrorForRollbar(error),
        obj: { ...obj, songs: null, }
      });
      throw error;
    }
  }
}
