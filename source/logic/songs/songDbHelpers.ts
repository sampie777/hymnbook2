import { Song, SongBundle, SongMetadata, Verse } from "../db/models/Songs";
import Db from "../db/db";
import { SongListModel, SongListSongModel, SongListVerseModel } from "../db/models/SongListModel";
import { AbcMelody, AbcSubMelody } from "../db/models/AbcMelodies";

export namespace SongDbHelpers {
  export const deleteAbcSubMelody = (obj: AbcSubMelody) => {
    Db.songs.realm().delete(obj);
  }

  export const deleteAbcMelody = (obj: AbcMelody) => {
    for (const child of obj.subMelodies) deleteAbcSubMelody(child);
    Db.songs.realm().delete(obj);
  }

  export const deleteVerse = (obj: Verse) => {
    Db.songs.realm().delete(obj);
  }

  export const deleteSongMetadata = (obj: SongMetadata) => {
    Db.songs.realm().delete(obj);
  }

  export const deleteSong = (obj: Song) => {
    for (const child of obj.verses) deleteVerse(child);
    for (const child of obj.metadata) deleteSongMetadata(child);
    for (const child of obj.abcMelodies) deleteAbcMelody(child);
    Db.songs.realm().delete(obj);
  }

  export const deleteSongBundle = (obj: SongBundle) => {
    for (const child of obj.songs) deleteSong(child);
    Db.songs.realm().delete(obj);
  }

  export const deleteSongListVerse = (obj: SongListVerseModel) => {
    Db.songs.realm().delete(obj);
  }

  export const deleteSongListSong = (obj: SongListSongModel) => {
    for (const child of obj.selectedVerses) deleteSongListVerse(child);
    Db.songs.realm().delete(obj);
  }

  export const deleteSongList = (obj: SongListModel) => {
    for (const child of obj.songs) deleteSongListSong(child);
    Db.songs.realm().delete(obj);
  }
}