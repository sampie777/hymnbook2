import Db from "../db";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";
import { DocumentGroup } from "../models/Documents";
import { DocumentGroupSchema } from "../models/DocumentsSchema";
import { DocumentProcessor } from "../../documents/documentProcessor";

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

    groups.forEach((it, index) => {
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

  export const patch = () => {
    removeDuplicateGroups();
  };
}