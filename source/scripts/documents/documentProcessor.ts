import { dateFrom, Result } from "../utils";
import Db from "../db/db";
import { Document, DocumentGroup } from "../../models/Documents";
import { DocumentGroup as ServerDocumentGroup, Document as ServerDocument } from "../../models/server/Documents";
import { DocumentGroupSchema, DocumentSchema } from "../../models/DocumentsSchema";
import { rollbar } from "../rollbar";

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
      .filtered(`name = "${group.name}"`);
    if (existingGroup.length > 0) {
      return new Result({ success: false, message: `Document group ${group.name} already exists` });
    }

    const conversionState: ConversionState = {
      groupId: Db.documents.getIncrementedPrimaryKey(DocumentGroupSchema),
      documentId: Db.documents.getIncrementedPrimaryKey(DocumentSchema),
      totalDocuments: 0
    };
    const documentGroup = convertServerDocumentGroupToLocalDocumentGroup(group, conversionState);

    try {
      Db.documents.realm().write(() => {
        Db.documents.realm().create(DocumentGroupSchema.name, documentGroup);
      });
    } catch (e: any) {
      rollbar.error(`Failed to import documents: ${e}`, e);
      return new Result({ success: false, message: `Failed to import document group: ${e}`, error: e as Error });
    }

    return new Result({ success: true, message: `${documentGroup.size} documents added!` });
  };

  export const convertServerDocumentGroupToLocalDocumentGroup = (group: ServerDocumentGroup, conversionState: ConversionState): DocumentGroup => {
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
      privateConversionState.totalDocuments,
      conversionState.groupId++
    );
  };

  const convertServerDocumentToLocalDocument = (document: ServerDocument, conversionState: ConversionState): Document => {
    return new Document(
      document.name,
      document.html,
      document.language,
      document.index,
      dateFrom(document.createdAt),
      dateFrom(document.modifiedAt),
      conversionState.documentId++
    );
  };

  export const loadLocalDocumentGroups = (): Result => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot load local document groups: document database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    const groups = Db.documents.realm()
      .objects<DocumentGroup>(DocumentGroupSchema.name)
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
}
