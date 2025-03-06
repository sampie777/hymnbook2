export const DocumentHistorySchema: Realm.ObjectSchema = {
  name: 'DocumentHistory',
  properties: {
    id: 'int',
    parentUuid: { type: 'string', indexed: true },
    parentName: 'string',
    documentUuid: { type: 'string', indexed: true },
    documentName: 'string',
    path: 'string',
    timestamp: 'date',
    viewDurationMs: 'int',
  },
  primaryKey: 'id',
};
