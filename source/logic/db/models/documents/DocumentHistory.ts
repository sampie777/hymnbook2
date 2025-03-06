import Db from '../../db';
import {DocumentHistorySchema} from './DocumentHistorySchema';

export class DocumentHistory {
  id: number;
  parentUuid: string;
  parentName: string;
  documentUuid: string;
  documentName: string;
  path: string;
  timestamp: Date;
  viewDurationMs: number;

  constructor(
    parentUuid: string,
    parentName: string,
    documentUuid: string,
    documentName: string = '',
    path: string = '',
    timestamp: Date = new Date(),
    viewDurationMs: number = 0,
    id = Db.documents.getIncrementedPrimaryKey(DocumentHistorySchema),
  ) {
    this.id = id;
    this.parentUuid = parentUuid;
    this.parentName = parentName;
    this.documentUuid = documentUuid;
    this.documentName = documentName;
    this.path = path;
    this.timestamp = timestamp;
    this.viewDurationMs = viewDurationMs;
  }
}
