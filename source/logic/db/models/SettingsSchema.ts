import Realm from "realm";

export const SettingSchema: Realm.ObjectSchema = {
  name: "Settings",
  primaryKey: "key",
  properties: {
    key: "string",
    value: "string"
  }
};
