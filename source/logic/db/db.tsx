import { DatabaseProvider } from "./dbProvider";
import { SongBundleSchema, SongMetadataSchema, SongSchema, VerseSchema } from "./models/SongsSchema";
import {
  SongListModelSchema,
  SongListSongModelSchema,
  SongListVerseModelSchema
} from "./models/SongListModelSchema";
import { SettingPatchSchema, SettingSchema } from "./models/SettingsSchema";
import { DocumentGroupSchema, DocumentSchema } from "./models/DocumentsSchema";
import { AbcMelodySchema, AbcSubMelodySchema } from "./models/AbcMelodiesSchema";

const Db = {
  songs: new DatabaseProvider({
    path: "hymnbook_songs",
    schemas: [
      AbcSubMelodySchema, AbcMelodySchema,
      SongMetadataSchema, VerseSchema, SongSchema, SongBundleSchema,
      SongListVerseModelSchema, SongListSongModelSchema, SongListModelSchema
    ],
    schemaVersion: 11
  }),
  documents: new DatabaseProvider({
    path: "hymnbook_documents",
    schemas: [
      DocumentSchema, DocumentGroupSchema
    ],
    schemaVersion: 5
  }),
  settings: new DatabaseProvider({
    path: "hymnbook_settings",
    schemas: [SettingSchema, SettingPatchSchema],
    schemaVersion: 2
  })
};

export default Db;
