import Realm from "realm";
import { AbcMelodySchema, AbcSubMelodySchema } from "./AbcMelodiesSchema";

export const VerseSchema: Realm.ObjectSchema = {
  name: "Verse",
  properties: {
    id: "int",
    name: "string",
    content: "string",
    language: "string",
    index: "int",
    uuid: "string",
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

export const SongSchema: Realm.ObjectSchema = {
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
    uuid: "string",
    verses: VerseSchema.name + "[]",
    abcMelodies: AbcMelodySchema.name + "[]",
    lastUsedMelody: AbcMelodySchema.name + "?",
    _songBundles: {
      type: "linkingObjects",
      objectType: "SongBundle",    // SongBundleSchema.name
      property: "songs"
    }
  },
  primaryKey: "id"
};

export const SongBundleSchema: Realm.ObjectSchema = {
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
    hash: "string",
    songs: SongSchema.name + "[]"
  },
  primaryKey: "id"
};
