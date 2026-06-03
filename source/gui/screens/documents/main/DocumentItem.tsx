import React from 'react';
import { Document } from '../../../../logic/db/models/documents/Documents';
import DocumentItemBaseComponent from './DocumentItemBaseComponent';
import MatchedDocumentSummary from "./search/MatchedDocumentSummary.tsx";
import { isDbItemValid } from "../../../../logic/utils/utils.ts";

interface ScreenProps {
  document: Document;
  onPress?: (document: Document) => void;
  searchRegex?: string;
  isContentMatch?: boolean;
  showDocumentGroup?: boolean;
  disabled?: boolean;
}

const DocumentItem: React.FC<ScreenProps> = ({
                                               document,
                                               onPress,
                                               searchRegex = "",
                                               isContentMatch = false,
                                               showDocumentGroup = false,
                                               disabled = false,
                                             }) => {
  if (!isDbItemValid(document)) return null;

  return (
    <DocumentItemBaseComponent
      disabled={disabled}
      documentName={document.name}
      parentName={showDocumentGroup ? Document.getParent(document)?.name : undefined}
      content={isContentMatch && <MatchedDocumentSummary document={document}
                                                         searchRegex={searchRegex} />}
      onPress={() => onPress?.(document)}
    />
  );
};

export default DocumentItem;
