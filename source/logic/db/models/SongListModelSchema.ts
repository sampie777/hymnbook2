import Realm from "realm";
import { SongSchema, VerseSchema } from "./SongsSchema";

export const SongListVerseModelSchema: Realm.ObjectSchema = {
  name: "SongListVerse",
  properties: {
    id: "int",
    verse: VerseSchema.name,
    _songListSong: {
      type: "linkingObjects",
      objectType: "SongListSong",    // SongListSongSchema.name
      property: "selectedVerses"
    }
  },
  primaryKey: "id"
};

export const SongListSongModelSchema: Realm.ObjectSchema = {
  name: "SongListSong",
  properties: {
    id: "int",
    index: "int",
    song: SongSchema.name,
    selectedVerses: SongListVerseModelSchema.name + "[]",
    _songList: {
      type: "linkingObjects",
      objectType: "SongList",    // SongListModelSchema.name
      property: "songs"
    }
  },
  primaryKey: "id"
};

export const SongListModelSchema: Realm.ObjectSchema = {
  name: "SongList",
  properties: {
    id: "int",
    name: "string",
    createdAt: "date",
    modifiedAt: "date",
    songs: SongListSongModelSchema.name + "[]"
  },
  primaryKey: "id"
};
