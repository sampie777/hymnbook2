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
    _songs: {
      type: "linkingObjects",
      objectType: "Song",    // SongSchema.name
      property: "verses"
    }
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
    _songBundles: {
      type: "linkingObjects",
      objectType: "SongBundle",    // SongBundleSchema.name
      property: "songs"
    }
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
