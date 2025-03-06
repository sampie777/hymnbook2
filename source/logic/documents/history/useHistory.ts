import { useEffect, useRef } from "react";
import {Document} from '../../db/models/documents/Documents';
import config from "../../../config";
import { DocumentHistoryController } from "./documentHistoryController";

const useHistory = (
  document: Document | undefined= undefined,
) => {
  const previousDocument = useRef<Document | undefined>();
  const startTime = useRef<Date | undefined>();

  useEffect(() => {
    checkViewTime();
    
    // Update values
    previousDocument.current = document ? Document.clone(document, {includeParent: true}): undefined;
    
    return () => {
      checkViewTime();
    }
  }, [document?.uuid]);
  
  useEffect(() => () => checkViewTime(), []);

  const checkViewTime = () => {
    const currentPreviousDocument = previousDocument.current;

    if (startTime.current == undefined) {
      startTime.current = new Date();
      return;
    }

    const endTime = new Date();
    const difference = endTime.getTime() - startTime.current.getTime();

    // We just opened a document
    if (document?.uuid != currentPreviousDocument?.uuid) {
      startTime.current = new Date();
    }

    // Check for valid objects
    if (currentPreviousDocument == undefined) return;

    // Check for changes
    if (document?.uuid == currentPreviousDocument.uuid) return;

    startTime.current = new Date();

    if (difference < config.documents.history.minViewTimeMs) return;

    DocumentHistoryController.pushDocument(currentPreviousDocument, undefined, difference);
  }
}

export default useHistory;