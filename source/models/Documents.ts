import Db from "../scripts/db/db";
import { DocumentGroupSchema, DocumentSchema } from "./DocumentsSchema";

export class Document {
  id: number;
  name: string;
  html: string;
  language: string;
  index: number;
  createdAt: Date;
  modifiedAt: Date;

  constructor(
    name: string,
    html: string,
    language: string,
    index: number,
    createdAt: Date,
    modifiedAt: Date,
    id = Db.documents.getIncrementedPrimaryKey(DocumentSchema)
  ) {
    this.id = id;
    this.name = name;
    this.html = html;
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
  createdAt: Date;
  modifiedAt: Date;
  size: number;
  isRoot: boolean;

  constructor(
    name: string,
    language: string,
    groups: Array<DocumentGroup> | null,
    items: Array<Document> | null,
    createdAt: Date,
    modifiedAt: Date,
    size: number = 0,
    isRoot: boolean = false,
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
    this.isRoot = isRoot;
  }
}
