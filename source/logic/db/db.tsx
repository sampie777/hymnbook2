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
import {isTestEnv} from "../utils";

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
      SongListVerseModelSchema, SongListSongModelSchema, SongListModelSchema
    ],
    schemaVersion: 13
  }),
  documents: new DatabaseProvider({
    path: generatePath("hymnbook_documents"),
    schemas: [
      DocumentSchema, DocumentGroupSchema
    ],
    schemaVersion: 6
  }),
  settings: new DatabaseProvider({
    path: generatePath("hymnbook_settings"),
    schemas: [SettingSchema, SettingPatchSchema],
    schemaVersion: 2
  })
};

export default Db;
