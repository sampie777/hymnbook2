import Db from "../scripts/db/db";
import { DocumentGroupSchema, DocumentSchema } from "./DocumentsSchema";

export class Document {
  id: number;
  name: string;
  content: string;
  language: string;
  index: number;
  createdAt: string;
  modifiedAt: string;

  constructor(
    name: string,
    content: string,
    language: string,
    index: number,
    createdAt: string,
    modifiedAt: string,
    id = Db.documents.getIncrementedPrimaryKey(DocumentSchema)
  ) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.language = language;
    this.index = index;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
  }
}

export class DocumentGroup {
  id: number;
  name: string;
  language: string;
  groups: Array<DocumentGroup> | null;
  items: Array<Document> | null;
  createdAt: string;
  modifiedAt: string;
  size: number;

  constructor(
    name: string,
    language: string,
    groups: Array<DocumentGroup> | null,
    items: Array<Document> | null,
    createdAt: string,
    modifiedAt: string,
    size: number = 0,
    id = Db.documents.getIncrementedPrimaryKey(DocumentGroupSchema)
  ) {
    this.id = id;
    this.name = name;
    this.language = language;
    this.groups = groups || [];
    this.items = items || [];
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.size = size || 0;
  }
}
