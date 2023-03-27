import Realm from "realm";

export const AbcSubMelodySchema: Realm.ObjectSchema = {
  name: "AbcSubMelody",
  properties: {
    id: "int",
    melody: "string",
    verse: "Verse", // VerseSchema.name
    _parent: {
      type: "linkingObjects",
      objectType: "AbcMelody",    // AbcMelodySchema.name
      property: "subMelodies"
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
    subMelodies: AbcSubMelodySchema.name + "[]",
    _song: {
      type: "linkingObjects",
      objectType: "Song",    // SongSchema.name
      property: "abcMelodies"
    }
  },
  primaryKey: "id"
};
