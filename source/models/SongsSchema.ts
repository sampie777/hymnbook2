export const VerseSchema = {
  name: "Verse",
  properties: {
    id: "int",
    name: "string",
    content: "string",
    language: "string",
    index: "int"
  },
  primaryKey: "id"
};

export const SongSchema = {
  name: "Song",
  properties: {
    id: "int",
    name: "string",
    author: "string",
    copyright: "string",
    language: "string",
    createdAt: "date",
    modifiedAt: "date",
    verses: VerseSchema.name + "[]"
  },
  primaryKey: "id"
};

export const SongBundleSchema = {
  name: "SongBundle",
  properties: {
    id: "int",
    abbreviation: "string",
    name: "string",
    language: "string",
    createdAt: "date",
    modifiedAt: "date",
    songs: SongSchema.name + "[]"
  },
  primaryKey: "id"
};
