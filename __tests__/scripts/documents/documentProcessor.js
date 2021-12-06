import { DocumentProcessor } from "../../../source/scripts/documents/documentProcessor";
import Db from "../../../source/scripts/db/db";
import { DocumentGroupSchema, DocumentSchema } from "../../../source/models/DocumentsSchema";
import { Document, DocumentGroup } from "../../../source/models/Documents";
import {
  Document as ServerDocument,
  DocumentGroup as ServerDocumentGroup,
} from "../../../source/models/server/Documents";

describe("test document processor", () => {
  const group = (name = "group 1", id = undefined, isRoot = false) => new DocumentGroup(name, "NL", [], [], new Date(), new Date(), 0, isRoot, id);
  const document = (name = "doc 1", id = undefined) => new Document(name, "", "NL", -1, new Date(), new Date(), id);
  const serverGroup = (name = "group 1", id = undefined) => new ServerDocumentGroup(name, "NL", [], [], (new Date()).toISOString(), (new Date()).toISOString(), 0, id);
  const serverDocument = (name = "doc 1", id = undefined) => new ServerDocument(name, "", "NL", -1, (new Date()).toISOString(), (new Date()).toISOString(), id);

  beforeEach(() => {
    return Db.documents.connect();
  });

  afterEach(() => {
    Db.documents.deleteDb();
  });

  it("converts document groups from server to local with the correct sizes", () => {
    const group2 = serverGroup("group 2", 2);
    const group21 = serverGroup("group 2.1", 3);
    const group22 = serverGroup("group 2.2", 4);
    const group221 = serverGroup("group 2.2.1", 5);

    group2.groups.push(group21);
    group2.groups.push(group22);
    group2.items.push(serverDocument("doc 2.1", 1));
    group2.items.push(serverDocument("doc 2.2", 2));

    group22.groups.push(group221);
    group22.items.push(serverDocument("doc 2.2.1", 3));

    group221.items.push(serverDocument("doc 2.2.1.1", 4));

    const conversionState = {
      groupId: 1,
      documentId: 1,
      totalDocuments: 0,
    };
    const result = DocumentProcessor.convertServerDocumentGroupToLocalDocumentGroup(group2, conversionState, true);

    expect(result.name).toBe("group 2");
    expect(result.size).toBe(4);
    expect(result.isRoot).toBe(true);
    expect(result.items.length).toBe(2);
    expect(result.groups.length).toBe(2);

    expect(result.groups[0].name).toBe("group 2.1");
    expect(result.groups[0].size).toBe(0);
    expect(result.groups[0].isRoot).toBe(false);
    expect(result.groups[0].items.length).toBe(0);
    expect(result.groups[0].groups.length).toBe(0);

    expect(result.groups[1].name).toBe("group 2.2");
    expect(result.groups[1].size).toBe(2);
    expect(result.groups[1].isRoot).toBe(false);
    expect(result.groups[1].items.length).toBe(1);
    expect(result.groups[1].groups.length).toBe(1);

    expect(result.groups[1].groups[0].name).toBe("group 2.2.1");
    expect(result.groups[1].groups[0].size).toBe(1);
    expect(result.groups[1].groups[0].isRoot).toBe(false);
    expect(result.groups[1].groups[0].items.length).toBe(1);
    expect(result.groups[1].groups[0].groups.length).toBe(0);

    expect(conversionState.totalDocuments).toBe(4);
    expect(conversionState.groupId).toBe(5);
    expect(conversionState.documentId).toBe(5);
  });

  it("saves document groups from server to local database", () => {
    const group2 = serverGroup("group 2", 2);
    const group21 = serverGroup("group 2.1", 3);
    const group22 = serverGroup("group 2.2", 4);
    const group221 = serverGroup("group 2.2.1", 5);

    group2.groups.push(group21);
    group2.groups.push(group22);
    group2.items.push(serverDocument("doc 1", 1));
    group2.items.push(serverDocument("doc 2", 2));
    group22.groups.push(group221);
    group22.items.push(serverDocument("doc 2.2.1", 3));
    group221.items.push(serverDocument("doc 2.2.1.1", 4));

    const result = DocumentProcessor.saveDocumentGroupToDatabase(group2);

    expect(result.message).toBe("4 documents added!");
    expect(result.success).toBe(true);
    expect(Db.documents.realm().objects(DocumentGroupSchema.name).length).toBe(4);
    expect(Db.documents.realm().objects(DocumentSchema.name).length).toBe(4);
    expect(Db.documents.realm().objects(DocumentGroupSchema.name)[0].name).toBe("group 2");
    expect(Db.documents.realm().objects(DocumentSchema.name)[1].name).toBe("doc 2.2.1");
  });

  it("loads all document groups from the database", () => {
    Db.documents.realm().write(() => {
      Db.documents.realm().create(DocumentGroupSchema.name, group("group 1", undefined, true));
      Db.documents.realm().create(DocumentGroupSchema.name, group("group 2", undefined, true));
    });

    const result = DocumentProcessor.loadLocalDocumentRoot();
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(2);
    expect(result.data[0].name).toBe("group 1");
    expect(result.data[1].name).toBe("group 2");
  });

  it("give error if db not connected when trying to load all document groups from the database", () => {
    Db.documents.disconnect();

    const result = DocumentProcessor.loadLocalDocumentRoot();
    expect(result.success).toBe(false);
    expect(result.message).toBe("Database is not connected");
  });

  it("deletes document group with all children from the database", () => {
    const group2 = group("group 2", 2);
    const group21 = group("group 2.1", 3);
    const group22 = group("group 2.2", 4);
    const group221 = group("group 2.2.1", 5);

    group2.groups.push(group21);
    group2.groups.push(group22);
    group2.items.push(document("doc 1", 1));
    group22.groups.push(group221);
    group22.items.push(document("doc 2.2.1", 2));

    Db.documents.realm().write(() => {
      Db.documents.realm().create(DocumentGroupSchema.name, group("group 1", 6));
      Db.documents.realm().create(DocumentGroupSchema.name, group2);
    });
    expect(Db.documents.realm().objects(DocumentGroupSchema.name).length).toBe(5);
    expect(Db.documents.realm().objects(DocumentSchema.name).length).toBe(2);

    const result = DocumentProcessor.deleteDocumentGroup(group2);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Deleted all for group 2");
    expect(Db.documents.realm().objects(DocumentGroupSchema.name).length).toBe(1);
    expect(Db.documents.realm().objects(DocumentSchema.name).length).toBe(0);
  });

  it("gives error when trying to delete document group which doesn't exists in the database", () => {
    const group2 = group("group 2", 2);
    Db.documents.realm().write(() => {
      Db.documents.realm().create(DocumentGroupSchema.name, group("group 1", 6));
    });
    expect(Db.documents.realm().objects(DocumentGroupSchema.name).length).toBe(1);

    const result = DocumentProcessor.deleteDocumentGroup(group2);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Cannot find document group group 2 in database");
    expect(Db.documents.realm().objects(DocumentGroupSchema.name).length).toBe(1);
  });
});
