import { Document, DocumentGroup } from "../db/models/documents/Documents";
import Db from "../db/db";
import { rollbar } from "../rollbar";
import { DocumentGroupSchema, DocumentSchema } from "../db/models/documents/DocumentsSchema";
import { sanitizeErrorForRollbar } from "../utils/utils.ts";

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

export const loadDocumentWithUuidOrId = (uuid?: string, id?: number): (Document & Realm.Object<Document>) | undefined => {
  if (uuid == "") uuid = undefined;

  if (uuid == undefined && id == undefined) {
    return undefined;
  }

  if (!Db.documents.isConnected()) {
    return undefined;
  }

  let query = `uuid = "${uuid}" OR id = ${id}`;
  if (id == undefined) query = `uuid = "${uuid}"`;
  if (uuid == undefined) query = `id = "${id}"`;

  const documents = Db.documents.realm().objects<Document>(DocumentSchema.name)
    .filtered(query);

  if (documents.length == 0) return undefined;
  if (documents.length > 1) {
    rollbar.warning("Multiple documents found for UUID and ID search", {
      uuid: uuid ?? (uuid === null ? "null" : "undefined"),
      id: id ?? (id === null ? "null" : "undefined"),
      documents: documents.map(it => ({ name: it.name, id: it.id, uuid: it.uuid }))
    });
  }

  return documents[0];
};