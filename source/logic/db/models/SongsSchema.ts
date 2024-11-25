import Realm from "realm";
import { AbcMelodySchema } from "./AbcMelodiesSchema";

export const SongMetadataSchema: Realm.ObjectSchema = {
  name: "SongMetadata",
  properties: {
    id: "int",
    type: "string",
    value: "string",
    _songs: {
      type: "linkingObjects",
      objectType: "Song",    // SongSchema.name
      property: "metadata"
    }
  },
  primaryKey: "id"
};

export const VerseSchema: Realm.ObjectSchema = {
  name: "Verse",
  properties: {
    id: "int",
    name: "string",
    content: "string",
    language: "string",
    index: "int",
    uuid: { type: "string", indexed: true },
    abcLyrics: "string?",
    _songs: {
      type: "linkingObjects",
      objectType: "Song",    // SongSchema.name
      property: "verses"
    }
  },
  primaryKey: "id"
};

export const SongSchema: Realm.ObjectSchema = {
  name: "Song",
  properties: {
    id: "int",
    name: { type: "string", indexed: true },
    number: { type: "int", optional: true, indexed: true },
    language: "string",
    createdAt: "date",
    modifiedAt: "date",
    uuid: { type: "string", indexed: true },
    verses: VerseSchema.name + "[]",
    metadata: SongMetadataSchema.name + "[]",
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
    uuid: { type: "string", indexed: true },
    hash: "string",
    songs: SongSchema.name + "[]"
  },
  primaryKey: "id"
};
