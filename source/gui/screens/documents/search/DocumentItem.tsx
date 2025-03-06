import React from 'react';
import {Document} from '../../../../logic/db/models/documents/Documents';
import DocumentItemBaseComponent from './DocumentItemBaseComponent';

interface ScreenProps {
  document: Document;
  onPress?: (document: Document) => void;
  searchText?: string;
}

const DocumentItem: React.FC<ScreenProps> = ({
  document,
  onPress,
  searchText,
}) => {
  const hasSearchText = searchText !== undefined && searchText.length > 0;

  return (
    <DocumentItemBaseComponent
      documentName={document.name}
      parentName={hasSearchText ? Document.getParent(document)?.name : undefined}
      onPress={() => onPress?.(document)}
    />
  );
};

export default DocumentItem;
