import { rollbar } from "../rollbar";
import Db from "../db/db";
import { dateFrom, Result } from "../utils";
import { Document, DocumentGroup } from "../db/models/Documents";
import { DocumentGroup as ServerDocumentGroup, Document as ServerDocument } from "../server/models/Documents";
import { DocumentGroupSchema, DocumentSchema } from "../db/models/DocumentsSchema";
import { DocumentServer } from "./documentServer";

export namespace DocumentProcessor {
  interface ConversionState {
    groupId: number;
    documentId: number;
    totalDocuments: number;
  }

  export const saveDocumentGroupToDatabase = (group: ServerDocumentGroup): Result => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot save local document group to database: document database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    if (group.items == null && group.groups == null) {
      rollbar.warning("Document group contains no documents or groups: " + group.name, group);
      return new Result({ success: false, message: "Document group contains no documents or groups" });
    }

    const existingGroup = Db.documents.realm()
      .objects<DocumentGroup>(DocumentGroupSchema.name)
      .filtered(`uuid = "${group.uuid}" AND isRoot = true`);
    if (existingGroup.length > 0) {
      return new Result({ success: false, message: `Document group ${group.name} already exists` });
    }

    const conversionState: ConversionState = {
      groupId: Db.documents.getIncrementedPrimaryKey(DocumentGroupSchema),
      documentId: Db.documents.getIncrementedPrimaryKey(DocumentSchema),
      totalDocuments: 0
    };
    const documentGroup = convertServerDocumentGroupToLocalDocumentGroup(group, conversionState, true);

    try {
      Db.documents.realm().write(() => {
        Db.documents.realm().create(DocumentGroupSchema.name, documentGroup);
      });
    } catch (e: any) {
      rollbar.error(`Failed to import documents: ${e}`, e);
      return new Result({ success: false, message: `Failed to import documents: ${e}`, error: e as Error });
    }

    return new Result({ success: true, message: `${documentGroup.name} added!` });
  };

  export const convertServerDocumentGroupToLocalDocumentGroup = (group: ServerDocumentGroup, conversionState: ConversionState, isRoot: boolean = false): DocumentGroup => {
    const privateConversionState: ConversionState = {
      groupId: conversionState.groupId,
      documentId: conversionState.documentId,
      totalDocuments: 0
    };

    const groups = group.groups
      ?.sort((a, b) => a.name.localeCompare(b.name))
      ?.map(it => convertServerDocumentGroupToLocalDocumentGroup(it, privateConversionState)) || [];

    const items = group.items
      ?.sort((a, b) => a.index - b.index)
      ?.map(it => convertServerDocumentToLocalDocument(it, privateConversionState)) || [];

    privateConversionState.totalDocuments += items.length;

    conversionState.groupId = privateConversionState.groupId;
    conversionState.documentId = privateConversionState.documentId;
    conversionState.totalDocuments += privateConversionState.totalDocuments;

    return new DocumentGroup(
      group.name,
      group.language,
      groups,
      items,
      dateFrom(group.createdAt),
      dateFrom(group.modifiedAt),
      group.uuid,
      privateConversionState.totalDocuments,
      isRoot,
      conversionState.groupId++
    );
  };

  const convertServerDocumentToLocalDocument = (document: ServerDocument, conversionState: ConversionState): Document => {
    return new Document(
      document.name,
      document.content,
      document.language,
      document.index,
      dateFrom(document.createdAt),
      dateFrom(document.modifiedAt),
      conversionState.documentId++
    );
  };


  export const fetchAndUpdateDocumentGroup = (group: ServerDocumentGroup): Promise<Result> => {
    return DocumentServer.fetchDocumentGroupWithChildrenAndContent(group)
      .then((result: Result) => updateAndSaveDocumentGroup(result.data))
  };

  const updateAndSaveDocumentGroup = (group: ServerDocumentGroup): Result => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot update documents: document database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    if (group.items == null && group.groups == null) {
      rollbar.warning("New document group contains no documents or groups: " + group.name, group);
      return new Result({
        success: false,
        message: `New update contains no documents. If this is correct, please manually remove ${group.name}.`
      });
    }

    const conversionState: ConversionState = {
      groupId: Db.documents.getIncrementedPrimaryKey(DocumentGroupSchema),
      documentId: Db.documents.getIncrementedPrimaryKey(DocumentSchema),
      totalDocuments: 0
    };
    const documentGroup = convertServerDocumentGroupToLocalDocumentGroup(group, conversionState, true);

    const existingGroup = Db.documents.realm()
      .objects<DocumentGroup>(DocumentGroupSchema.name)
      .filtered(`uuid = "${group.uuid}" AND isRoot = true`);
    if (existingGroup.length === 0) {
      rollbar.warning("To-be-updated document group doesn't exists locally: " + group.name, group);
    }

    try {
      Db.documents.realm().write(() => {
        Db.documents.realm().create(DocumentGroupSchema.name, documentGroup);
      });
    } catch (e: any) {
      rollbar.error(`Failed to update documents: ${e}`, e);
      return new Result({ success: false, message: `Failed to update documents: ${e}`, error: e as Error });
    }

    if (existingGroup.length > 0) {
      const deleteResult = deleteDocumentGroup(existingGroup[0]);
      if (!deleteResult.success) {
        return deleteResult;
      }
    }

    return new Result({ success: true, message: `${documentGroup.name} updated!` });
  };

  export const loadLocalDocumentRoot = (): Result => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot load local document groups: document database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    const groups = Db.documents.realm()
      .objects<DocumentGroup>(DocumentGroupSchema.name)
      .filtered(`isRoot = true`)
      .sorted(`name`)
      .map(it => it as unknown as DocumentGroup);

    return new Result({ success: true, data: groups });
  };

  export const deleteDocumentDatabase = (): Promise<Result> => {
    Db.documents.deleteDb();

    return Db.documents.connect()
      .then(_ => new Result({ success: true, message: "Deleted all documents" }))
      .catch(e => {
        rollbar.error("Could not connect to local document database after deletions: " + e?.toString(), e);
        return new Result({ success: false, message: "Could not reconnect to local database after deletions: " + e });
      });
  };

  export const deleteDocumentGroup = (group: DocumentGroup): Result => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot delete document group: document database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    const deleteGroup = Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name).find(it => it.id === group.id);
    if (deleteGroup === null || deleteGroup === undefined) {
      rollbar.error(`Trying to delete document group which does not exist in database: ${group}`);
      return new Result({ success: false, message: `Cannot find document group ${group.name} in database` });
    }

    const groupName = deleteGroup.name;

    // Shallow copy
    const deleteGroups = deleteGroup.groups?.slice(0) || [];
    deleteGroups.forEach(it => {
      deleteDocumentGroup(it);
    });

    Db.documents.realm().write(() => {
      Db.documents.realm().delete(deleteGroup.items);
      Db.documents.realm().delete(deleteGroup);
    });

    return new Result({ success: true, message: `Deleted all for ${groupName}` });
  };

  export const getAllLanguagesFromDocumentGroups = (groups: Array<ServerDocumentGroup | DocumentGroup>) => {
    if (groups.length === 0) {
      return [];
    }

    const languages: Array<string> = [];
    groups.forEach(it => {
      if (!languages.includes(it.language)) {
        languages.push(it.language);
      }
    });

    return languages;
  };

  export const determineDefaultFilterLanguage = (groups: Array<ServerDocumentGroup | DocumentGroup>) => {
    if (groups.length === 0) {
      return "";
    }

    const languageCount = {};
    groups.forEach(it => {
      // @ts-ignore
      languageCount[it.language] = (languageCount[it.language] || 0) + 1;
    });

    const languageTopList = Object.entries(languageCount)
      .sort((a: Array<any>, b: Array<any>) => b[1] - a[1]);
    return languageTopList[0][0];
  };

  export const hasUpdate = (serverGroups: ServerDocumentGroup[], group: DocumentGroup): boolean => {
    const serverGroup = serverGroups.find(it => it.uuid == group.uuid);
    if (serverGroup === undefined) {
      return false;
    }

    const serverDate = dateFrom(serverGroup.modifiedAt);
    const localDate = group.modifiedAt;
    return serverDate > localDate;
  };

  export const getMatchingServerGroup = (serverGroups: ServerDocumentGroup[], group: DocumentGroup): ServerDocumentGroup | undefined => {
    return serverGroups.find(it => it.uuid == group.uuid);
  };

  export const isGroupLocal = (localGroups: DocumentGroup[], group: ServerDocumentGroup) => {
    return localGroups.some(it => it.uuid == group.uuid);
  };

  export const updateLocalGroupsWithUuid = (localGroups: DocumentGroup[], serverGroups: ServerDocumentGroup[]) => {
    if (serverGroups.length === 0) {
      return;
    }

    localGroups
      .filter(it => it.uuid == "")
      .forEach(it => {
        const serverGroup = serverGroups.find(serverGroup => serverGroup.name == it.name);
        if (serverGroup === undefined) {
          return;
        }

        try {
          Db.documents.realm().write(() => {
            it.uuid = serverGroup.uuid;
          });
        } catch (e: any) {
          rollbar.error(`Failed to update document group ${it.name} with new UUID: ${e}`, e);
        }
      });
  };
}
