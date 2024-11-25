import Db from "../db/db";
import { Document, DocumentGroup } from "../db/models/Documents";
import { rollbar } from "../rollbar";
import { sanitizeErrorForRollbar } from "../utils";

export namespace DocumentDbHelpers {
  export const deleteDocument = (obj: Document) => {
    try {
      Db.documents.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB Document", {
        ...sanitizeErrorForRollbar(error),
        obj: { ...obj, _parent: null, }
      });
      throw error;
    }
  }

  export const deleteDocumentGroup = (obj: DocumentGroup) => {
    for (const child of obj.groups ?? []) deleteDocumentGroup(child);
    for (const child of obj.items ?? []) deleteDocument(child);
    try {
      Db.documents.realm().delete(obj);
    } catch (error) {
      rollbar.error("Failed to delete DB Document", {
        ...sanitizeErrorForRollbar(error),
        obj: { ...obj, groups: null, items: null, _parent: null, }
      });
      throw error;
    }
  }
}