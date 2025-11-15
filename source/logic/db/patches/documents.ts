import Db from "../db";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils/utils.ts";
import { DocumentGroup } from "../models/documents/Documents";
import { DocumentGroupSchema, DocumentSchema } from "../models/documents/DocumentsSchema";
import { DocumentProcessor } from "../../documents/documentProcessor";
import { removeObjectsWithoutParents } from "./utils";

export namespace DocumentDbPatch {
  /**
   * Loop through all groups from new to old. If for any group a matching
   * group is found, which is newer, remove the older group.
   */
  const removeDuplicateGroups = () => {
    const approvedUuids: string[] = [];
    const groups = Db.documents.realm()
      .objects<DocumentGroup>(DocumentGroupSchema.name)
      .sorted("id", true);
    // Ignore root as all groups could be checked

    groups.forEach(it => {
      const isDuplicate = approvedUuids.includes(it.uuid);
      if (!isDuplicate) {
        approvedUuids.push(it.uuid);
        return;
      }

      try {
        DocumentProcessor.deleteDocumentGroup(it);
      } catch (error) {
        rollbar.warning("Failed to remove older duplicate group", {
          ...sanitizeErrorForRollbar(error),
          group: it,
          approvedUuids: approvedUuids,
          groups: groups.map(it => ({
            id: it.id,
            name: it.name,
            uuid: it.uuid,
            hash: it.hash
          }))
        });
      }
    });
  };

  const removeDocumentObjectsWithoutParents = () => {
    removeObjectsWithoutParents(Db.documents,
      [
        { schemaName: DocumentGroupSchema.name, parentLink: '_parent', extraQuery: 'AND isRoot = false' },
        { schemaName: DocumentSchema.name, parentLink: '_parent', },
      ]);
  }

  export const patch = () => {
    try {
      removeDuplicateGroups();
    } catch (error) {
      rollbar.error("Failed to remove duplicate groups", sanitizeErrorForRollbar(error));
    }
    try {
      removeDocumentObjectsWithoutParents();
    } catch (error) {
      rollbar.error("Failed to remove document objects without parents", sanitizeErrorForRollbar(error));
    }
  };
}