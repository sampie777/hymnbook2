import { DatabaseProvider } from "./dbProvider";
import { SongBundleSchema, SongMetadataSchema, SongSchema, VerseSchema } from "./models/songs/SongsSchema";
import {
  SongListModelSchema,
  SongListSongModelSchema,
  SongListVerseModelSchema
} from "./models/songs/SongListModelSchema";
import { SettingPatchSchema, SettingSchema } from "./models/SettingsSchema";
import { DocumentGroupSchema, DocumentSchema } from "./models/documents/DocumentsSchema";
import { AbcMelodySchema, AbcSubMelodySchema } from "./models/songs/AbcMelodiesSchema";
import { SongHistorySchema } from "./models/songs/SongHistorySchema";
import { isTestEnv } from "../utils";
import { DocumentHistorySchema } from "./models/documents/DocumentHistorySchema";

const generatePath = (name: string): string => {
  if (!isTestEnv()) return name;
  // Add random suffix so tests can run parallel
  return name + "." + Math.random().toString(36).substring(2);
}

const Db = {

  songs: new DatabaseProvider({
    path: generatePath("hymnbook_songs"),
    schemas: [
      AbcSubMelodySchema, AbcMelodySchema,
      SongMetadataSchema, VerseSchema, SongSchema, SongBundleSchema,
      SongListVerseModelSchema, SongListSongModelSchema, SongListModelSchema,
      SongHistorySchema,
    ],
    schemaVersion: 14
  }),
  documents: new DatabaseProvider({
    path: generatePath("hymnbook_documents"),
    schemas: [
      DocumentSchema, DocumentGroupSchema,
      DocumentHistorySchema,
    ],
    schemaVersion: 8
  }),
  settings: new DatabaseProvider({
    path: generatePath("hymnbook_settings"),
    schemas: [SettingSchema, SettingPatchSchema],
    schemaVersion: 2
  })
};

export default Db;
