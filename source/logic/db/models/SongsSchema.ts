import { AbcMelodySchema, AbcSubMelodySchema } from "./AbcMelodiesSchema";

export const VerseSchema = {
  name: "Verse",
  properties: {
    id: "int",
    name: "string",
    content: "string",
    language: "string",
    index: "int",
    abcLyrics: "string?",
    _songs: {
      type: "linkingObjects",
      objectType: "Song",    // SongSchema.name
      property: "verses"
    },
    _abcMelodies: {
      type: "linkingObjects",
      objectType: AbcSubMelodySchema.name,
      property: "verse"
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
    abcMelodies: AbcMelodySchema.name + "[]",
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
    author: "string",
    copyright: "string",
    createdAt: "date",
    modifiedAt: "date",
    uuid: "string",
    songs: SongSchema.name + "[]"
  },
  primaryKey: "id"
};
