import React from "react";
import { Document } from "../../../../../logic/db/models/documents/Documents.ts";
import DocumentSummary from "./DocumentSummary.tsx";

interface Props {
  document: Document;
  searchRegex: string;
}

const MatchedDocumentSummary: React.FC<Props> = ({ document, searchRegex }) => {
  const getFirstMatchIndex = (document: Document): number =>
    document.html.split("\n")
      .findIndex(it => (new RegExp(searchRegex, "i")).test(it));

  return <DocumentSummary key={document.id}
                          document={document}
                          preferredStartLine={Math.max(0, getFirstMatchIndex(document))}
                          maxLines={2}
                          searchText={searchRegex} />
};

export default MatchedDocumentSummary;
