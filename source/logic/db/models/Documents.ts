import Db from "../db";
import { DocumentGroupSchema, DocumentSchema } from "./DocumentsSchema";

export class Document {
  id: number;
  name: string;
  html: string;
  language: string;
  index: number;
  createdAt: Date;
  modifiedAt: Date;
  uuid: string;
  _parent?: Array<DocumentGroup>;

  constructor(
    name: string,
    html: string,
    language: string,
    index: number,
    createdAt: Date,
    modifiedAt: Date,
    uuid: string,
    id = Db.documents.getIncrementedPrimaryKey(DocumentSchema),
    parent?: DocumentGroup
  ) {
    this.id = id;
    this.name = name;
    this.html = html;
    this.language = language;
    this.index = index;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.uuid = uuid;
    this._parent = parent === undefined ? [] : [parent];
  }

  static getParent(document?: Document): DocumentGroup | undefined {
    if (document === undefined) {
      return undefined;
    }

    if (document._parent === undefined || document._parent.length === 0) {
      return undefined;
    }

    return document._parent[0];
  }

  static clone(obj: Document, options: { includeParent: boolean } = { includeParent: false }): Document {
    const parent = Document.getParent(obj);

    return new Document(
      obj.name,
      obj.html,
      obj.language,
      obj.index,
      obj.createdAt,
      obj.modifiedAt,
      obj.uuid,
      obj.id,
      !options.includeParent || parent == undefined ? undefined :
        DocumentGroup.clone(parent, { ...options, includeChildren: false }),
    )
  }
}

export class DocumentGroup {
  id: number;
  name: string;
  language: string;
  groups: DocumentGroup[] | null;
  items: Document[] | null;
  createdAt: Date;
  modifiedAt: Date;
  uuid: string;
  hash?: string;
  size: number;
  isRoot: boolean;
  _parent?: DocumentGroup[];

  constructor(
    name: string,
    language: string,
    groups: DocumentGroup[] | null,
    items: Document[] | null,
    createdAt: Date,
    modifiedAt: Date,
    uuid: string,
    hash?: string,
    size: number = 0,
    isRoot: boolean = false,
    id = Db.documents.getIncrementedPrimaryKey(DocumentGroupSchema),
    parent?: DocumentGroup
  ) {
    this.id = id;
    this.name = name;
    this.language = language;
    this.groups = groups || [];
    this.items = items || [];
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.uuid = uuid;
    this.hash = hash;
    this.size = size || 0;
    this.isRoot = isRoot;
    this._parent = parent === undefined ? [] : [parent];
  }

  static getParent(group?: DocumentGroup): DocumentGroup | undefined {
    if (group === undefined) {
      return undefined;
    }

    if (group._parent === undefined || group._parent.length === 0) {
      return undefined;
    }

    return group._parent[0];
  }

  static clone(obj: DocumentGroup, options: {
    includeChildren: boolean,
    includeParent: boolean
  } = {
    includeChildren: false,
    includeParent: false
  }): DocumentGroup {
    const parent = DocumentGroup.getParent(obj);

    return new DocumentGroup(
      obj.name,
      obj.language,
      !options.includeChildren ? [] :
        obj.groups?.map(it => DocumentGroup.clone(it, { ...options, includeParent: false })) ?? null,
      !options.includeChildren ? [] : obj.items, // todo: clone
      obj.createdAt,
      obj.modifiedAt,
      obj.uuid,
      obj.hash,
      obj.size,
      obj.isRoot,
      obj.id,
      !options.includeParent || parent == undefined ? undefined :
        DocumentGroup.clone(parent, { ...options, includeParent: false }),
    )
  }
}
