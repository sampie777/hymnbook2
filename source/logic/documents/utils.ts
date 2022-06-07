import { DocumentGroup } from "../db/models/Documents";
import Db from "../db/db";
import { DocumentGroupSchema } from "../db/models/DocumentsSchema";

export const getParentForDocumentGroup = (group: DocumentGroup): DocumentGroup | null => {
  if (group === undefined || group.isRoot) {
    return null;
  }

  const parent = Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name)
    .filtered("groups.id = $0", group.id);

  if (parent === undefined || parent === null || parent.length === 0) {
    return null;
  }

  return parent[0] as unknown as DocumentGroup;
};
