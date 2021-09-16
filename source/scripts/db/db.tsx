import { DatabaseProvider } from "./dbProvider";
import { SongBundleSchema, SongSchema, VerseSchema } from "../../models/SongsSchema";
import { SongListModelSchema, SongListSongModelSchema } from "../../models/SongListModelSchema";
import { SettingSchema } from "../../models/SettingsSchema";

const Db = {
  songs: new DatabaseProvider({
    path: "hymnbook_songs",
    schemas: [VerseSchema, SongSchema, SongBundleSchema, SongListSongModelSchema, SongListModelSchema],
    schemaVersion: 1
  }),
  settings: new DatabaseProvider({
    path: "hymnbook_settings",
    schemas: [SettingSchema],
    schemaVersion: 1
  })
};

export default Db;
