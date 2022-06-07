import { SongSchema, VerseSchema } from "./SongsSchema";

export const SongListVerseModelSchema = {
  name: "SongListVerse",
  properties: {
    id: "int",
    verse: VerseSchema.name,
  },
  primaryKey: "id"
};

export const SongListSongModelSchema = {
  name: "SongListSong",
  properties: {
    id: "int",
    index: "int",
    song: SongSchema.name,
    selectedVerses: SongListVerseModelSchema.name + "[]"
  },
  primaryKey: "id"
};

export const SongListModelSchema = {
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
