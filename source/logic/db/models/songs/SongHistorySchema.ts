export const SongHistorySchema: Realm.ObjectSchema = {
  name: "SongHistory",
  properties: {
    id: "int",
    bundleUuid: { type: "string", indexed: true },
    bundleName: "string",
    songUuid: { type: "string", indexed: true },
    songName: "string",
    verseUuid: "string",
    verseName: "string",
    verseIndex: "int",
    timestamp: "date",
    viewDurationMs: "int",
    action: "string",
    songListItemId: "int?",
  },
  primaryKey: "id"
};
