import { Document as ServerDocument, DocumentGroup as ServerDocumentGroup } from "../../server/models/Documents";
import { Document, DocumentGroup } from "../../db/models/Documents";
import { dateFrom } from "../../utils";

export namespace DocumentUpdaterUtils {
  export interface ConversionState {
    groupId: number;
    documentId: number;
    totalDocuments: number;
  }

  export const convertServerDocumentGroupToLocalDocumentGroup = (group: ServerDocumentGroup, conversionState: ConversionState, isRoot: boolean = false): DocumentGroup => {
    const privateConversionState: ConversionState = {
      groupId: conversionState.groupId,
      documentId: conversionState.documentId,
      totalDocuments: 0
    };

    const groups = group.groups
      ?.sort((a, b) => a.name.localeCompare(b.name))
      ?.map(it => convertServerDocumentGroupToLocalDocumentGroup(it, privateConversionState)) || [];

    const items = group.items
      ?.sort((a, b) => a.index - b.index)
      ?.map(it => convertServerDocumentToLocalDocument(it, privateConversionState)) || [];

    privateConversionState.totalDocuments += items.length;

    conversionState.groupId = privateConversionState.groupId;
    conversionState.documentId = privateConversionState.documentId;
    conversionState.totalDocuments += privateConversionState.totalDocuments;

    return new DocumentGroup(
      group.name,
      group.language,
      groups,
      items,
      dateFrom(group.createdAt),
      dateFrom(group.modifiedAt),
      group.uuid,
      group.hash,
      privateConversionState.totalDocuments,
      isRoot,
      conversionState.groupId++
    );
  };

  const convertServerDocumentToLocalDocument = (document: ServerDocument, conversionState: ConversionState): Document => {
    return new Document(
      document.name,
      document.content,
      document.language,
      document.index,
      dateFrom(document.createdAt),
      dateFrom(document.modifiedAt),
      document.uuid,
      conversionState.documentId++
    );
  };
}