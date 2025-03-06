import { DocumentGroup as ServerDocumentGroup } from "../../server/models/Documents";
import { Result, sanitizeErrorForRollbar } from "../../utils";
import { DocumentServer } from "../documentServer";
import Db from "../../db/db";
import { rollbar } from "../../rollbar";
import { DocumentGroupSchema, DocumentSchema } from "../../db/models/documents/DocumentsSchema";
import { DocumentGroup } from "../../db/models/documents/Documents";
import { DocumentProcessor } from "../documentProcessor";
import { DocumentUpdaterUtils } from "./documentUpdaterUtils";

export namespace DocumentUpdater {

  export const fetchAndSaveDocumentGroup = (group: { uuid: string }): Promise<any> => {
    return DocumentServer.fetchDocumentGroupWithChildrenAndContent(group)
      .then(saveDocumentGroupToDatabase);
  };

  export const fetchAndUpdateDocumentGroup = (group: { uuid: string }): Promise<any> => {
    return DocumentServer.fetchDocumentGroupWithChildrenAndContent(group)
      .then(updateAndSaveDocumentGroup);
  };

  export const saveDocumentGroupToDatabase = (group: ServerDocumentGroup) => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot save local document group to database: document database is not connected");
      throw new Error("Database is not connected");
    }

    if (group.items == null && group.groups == null) {
      rollbar.warning("Document group contains no documents or groups: " + group.name, group);
      throw new Error("Document group contains no documents or groups");
    }

    const existingGroup = Db.documents.realm()
      .objects<DocumentGroup>(DocumentGroupSchema.name)
      .filtered(`uuid = "${group.uuid}" AND isRoot = true`);
    if (existingGroup.length > 0) {
      throw new Error(`Document group ${group.name} already exists`);
    }

    const conversionState: DocumentUpdaterUtils.ConversionState = {
      groupId: Db.documents.getIncrementedPrimaryKey(DocumentGroupSchema),
      documentId: Db.documents.getIncrementedPrimaryKey(DocumentSchema),
      totalDocuments: 0
    };
    const documentGroup = DocumentUpdaterUtils.convertServerDocumentGroupToLocalDocumentGroup(group, conversionState, true);

    try {
      Db.documents.realm().write(() => {
        Db.documents.realm().create(DocumentGroupSchema.name, documentGroup);
      });
    } catch (error) {
      rollbar.error(`Failed to import documents`, sanitizeErrorForRollbar(error));
      throw new Error(`Failed to import documents: ${error}`);
    }
  };

  const updateAndSaveDocumentGroup = (group: ServerDocumentGroup) => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot update documents: document database is not connected");
      throw new Error ("Database is not connected");
    }

    if (group.items == null && group.groups == null) {
      rollbar.warning("New document group contains no documents or groups: " + group.name, group);
      throw new Error(`New update contains no documents. If this is correct, please manually remove ${group.name}.`);
    }

    const conversionState: DocumentUpdaterUtils.ConversionState = {
      groupId: Db.documents.getIncrementedPrimaryKey(DocumentGroupSchema),
      documentId: Db.documents.getIncrementedPrimaryKey(DocumentSchema),
      totalDocuments: 0
    };
    const documentGroup = DocumentUpdaterUtils.convertServerDocumentGroupToLocalDocumentGroup(group, conversionState, true);

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
    } catch (error) {
      rollbar.error(`Failed to update documents`, sanitizeErrorForRollbar(error));
      throw new Error(`Failed to update documents: ${error}`);
    }

    if (existingGroup.length > 0) {
      const deleteResult = DocumentProcessor.deleteDocumentGroup(existingGroup[0]);
      deleteResult.throwIfException();
    }
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
        } catch (error) {
          rollbar.error(`Failed to update document group with new UUID`, {
            ...sanitizeErrorForRollbar(error),
            group: { ...it, groups: null, items: null }
          });
        }
      });
  };
}