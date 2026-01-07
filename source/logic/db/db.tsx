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
import { isTestEnv } from "../utils/utils.ts";
import { DocumentHistorySchema } from "./models/documents/DocumentHistorySchema";
import {
  AddressSchema,
  CoordinatesSchema,
  LicenseSchema,
  OrganizationSchema
} from "./models/organizations/OrganizationsSchema.ts";

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
    schemaVersion: 15
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
    schemas: [
      SettingSchema, SettingPatchSchema,
      LicenseSchema, AddressSchema, CoordinatesSchema, OrganizationSchema,
    ],
    schemaVersion: 3
  })
};

export default Db;
