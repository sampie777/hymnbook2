import Realm from "realm";

export const SettingSchema: Realm.ObjectSchema = {
  name: "Settings",
  primaryKey: "key",
  properties: {
    key: "string",
    value: "string"
  }
};

export const SettingPatchSchema: Realm.ObjectSchema = {
  name: "SettingPatch",
  primaryKey: "id",
  properties: {
    id: "int",
    createdAt: "date",
  }
}