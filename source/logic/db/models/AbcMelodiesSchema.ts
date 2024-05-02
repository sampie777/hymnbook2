import Realm from "realm";

export const AbcSubMelodySchema: Realm.ObjectSchema = {
  name: "AbcSubMelody",
  properties: {
    id: "int",
    melody: "string",
    uuid: "string",
    parentUuid: "string",
    _verse: {
      type: "linkingObjects",
      objectType: "Verse",    // VerseSchema.name
      property: "abcMelodies"
    },
  },
  primaryKey: "id"
};

export const AbcMelodySchema: Realm.ObjectSchema = {
  name: "AbcMelody",
  properties: {
    id: "int",
    name: "string",
    melody: "string",
    uuid: "string",
    _song: {
      type: "linkingObjects",
      objectType: "Song",    // SongSchema.name
      property: "abcMelodies"
    }
  },
  primaryKey: "id"
};
