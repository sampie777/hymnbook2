export const VerseSchema = {
  name: "Verse",
  properties: {
    id: "int",
    name: "string",
    content: "string",
    language: "string",
    index: "int",
    abcMelody: "string?",
    abcLyrics: "string?",
  },
  primaryKey: "id"
};

export const SongSchema = {
  name: "Song",
  properties: {
    id: "int",
    name: "string",
    number: "int?",
    author: "string",
    copyright: "string",
    language: "string",
    createdAt: "date",
    modifiedAt: "date",
    verses: VerseSchema.name + "[]",
    abcMelody: "string?",
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
