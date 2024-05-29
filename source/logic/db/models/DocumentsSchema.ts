import Realm from "realm";

export const DocumentSchema: Realm.ObjectSchema = {
  name: "Document",
  properties: {
    id: "int",
    name: { type: "string", indexed: true },
    html: "string",
    language: "string",
    index: "int",
    createdAt: "date",
    modifiedAt: "date",
    uuid: {type: "string", indexed: true},
    _parent: {
      type: "linkingObjects",
      objectType: "DocumentGroup",    // DocumentGroupSchema.name
      property: "items"
    }
  },
  primaryKey: "id"
};

export const DocumentGroupSchema: Realm.ObjectSchema = {
  name: "DocumentGroup",
  properties: {
    id: "int",
    name: { type: "string", indexed: true },
    language: "string",
    groups: "DocumentGroup[]",
    items: DocumentSchema.name + "[]",
    size: "int",
    createdAt: "date",
    modifiedAt: "date",
    uuid: {type: "string", indexed: true},
    hash: "string?",
    isRoot: { type: "bool", indexed: true },
    _parent: {
      type: "linkingObjects",
      objectType: "DocumentGroup",    // DocumentGroupSchema.name
      property: "groups"
    }
  },
  primaryKey: "id"
};
