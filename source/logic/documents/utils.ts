import { Document, DocumentGroup } from "../db/models/documents/Documents";
import Db from "../db/db";
import { rollbar } from "../rollbar";
import { DocumentGroupSchema } from "../db/models/documents/DocumentsSchema";
import { sanitizeErrorForRollbar } from "../utils";

export const getParentForDocumentGroup = (group: DocumentGroup): (DocumentGroup & Realm.Object<DocumentGroup>) | null => {
  if (group === undefined || group.isRoot) {
    return null;
  }

  const parent = Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name)
    .filtered("groups.id = $0", group.id);

  if (parent === undefined || parent === null || parent.length === 0) {
    return null;
  }

  return parent[0];
};

export const getParentForDocumentOrDocumentGroup = (item: Document | DocumentGroup): DocumentGroup | undefined => {
  if (item instanceof Document)
    return Document.getParent(item);
  return DocumentGroup.getParent(item);
};

export const getPathForDocument = (document: Document): Array<Document | DocumentGroup> => {
  const path: Array<Document | DocumentGroup> = [document];

  try {
    let parent;
    while (parent = getParentForDocumentOrDocumentGroup(path[path.length - 1])) {
      path.push(parent);
    }
    path.reverse();
  } catch (error) {
    rollbar.error(`Failed to get path for document`, {
      ...sanitizeErrorForRollbar(error),
      document: document
    });
  }

  return path;
};
