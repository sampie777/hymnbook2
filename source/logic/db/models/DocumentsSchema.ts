import Realm from "realm";

export const DocumentSchema: Realm.ObjectSchema = {
  name: "Document",
  properties: {
    id: "int",
    name: "string",
    html: "string",
    language: "string",
    index: "int",
    createdAt: "date",
    modifiedAt: "date",
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
    name: "string",
    language: "string",
    groups: "DocumentGroup[]",
    items: DocumentSchema.name + "[]",
    size: "int",
    createdAt: "date",
    modifiedAt: "date",
    uuid: "string",
    hash: "string?",
    isRoot: "bool",
    _parent: {
      type: "linkingObjects",
      objectType: "DocumentGroup",    // DocumentGroupSchema.name
      property: "groups"
    }
  },
  primaryKey: "id"
};
