import { SongSchema } from "./SongsSchema";

export const SongListSongModelSchema = {
  name: "SongListSong",
  properties: {
    id: "int",
    index: "int",
    song: SongSchema.name
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
