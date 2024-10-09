import Db from "../db/db";
import { Document, DocumentGroup } from "../db/models/Documents";

export namespace DocumentDbHelpers {
  export const deleteDocument = (obj: Document) => {
    Db.documents.realm().delete(obj);
  }

  export const deleteDocumentGroup = (obj: DocumentGroup) => {
    for (const child of obj.groups ?? []) deleteDocumentGroup(child);
    for (const child of obj.items ?? []) deleteDocument(child);
    Db.documents.realm().delete(obj);
  }
}