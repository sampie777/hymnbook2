import Realm from "realm";

export const AbcSubMelodySchema: Realm.ObjectSchema = {
  name: "AbcSubMelody",
  properties: {
    id: "int",
    uuid: "string",
    name: "string",
    melody: "string",
    verseUuids: "string[]"
  },
  primaryKey: "id"
};

export const AbcMelodySchema: Realm.ObjectSchema = {
  name: "AbcMelody",
  properties: {
    id: "int",
    uuid: "string",
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
