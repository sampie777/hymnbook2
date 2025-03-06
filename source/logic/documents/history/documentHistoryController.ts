import {Document, DocumentGroup} from '../../db/models/documents/Documents';
import {rollbar} from '../../rollbar';
import {DocumentHistory} from '../../db/models/documents/DocumentHistory';
import Db from '../../db/db';
import {DocumentHistorySchema} from '../../db/models/documents/DocumentHistorySchema';
import {getPathForDocument} from '../utils';

export namespace DocumentHistoryController {
  export const pushDocument = (
    document: Document,
    parent?: DocumentGroup,
    viewDurationMs: number = -1,
  ) => {
    if (!document.uuid) {
      return rollbar.error(
        "Can't store document in history as it has no uuid",
        {document: {...document, html: undefined, _parent: undefined}},
      );
    }

    if (!parent) parent = Document.getParent(document);
    if (parent == null) {
      return rollbar.error(
        "Can't store document in history as no parent is found",
        {document: {...document, html: undefined, _parent: undefined}},
      );
    }

    if (!parent.uuid) {
      return rollbar.error(
        "Can't store document in history as its parent has no uuid",
        {
          document: {...document, html: undefined, _parent: undefined},
          parent: {
            ...parent,
            groups: undefined,
            items: undefined,
            _parent: undefined,
          },
        },
      );
    }

    const path = getPathForDocument(document)
      .map(it => it.name)
      .join('  >  ');

    const entry = new DocumentHistory(
      parent.uuid,
      parent.name,
      document.uuid,
      document.name,
      path,
      new Date(),
      viewDurationMs,
    );

    saveToDatabase(entry, document, parent);
  };

  const saveToDatabase = (
    entry: DocumentHistory,
    document?: Document,
    parent?: DocumentGroup,
  ) => {
    try {
      Db.documents.realm().write(() => {
        const result = Db.documents
          .realm()
          .create(DocumentHistorySchema.name, entry);
        entry.id = result.id;
      });
    } catch (error) {
      rollbar.error('Failed to store document history', {
        document: {
          ...document,
          html: undefined,
          _parent: undefined,
        },
        parent: {
          ...parent,
          groups: undefined,
          items: undefined,
          _parent: undefined,
        },
      });
    }
  };
}
