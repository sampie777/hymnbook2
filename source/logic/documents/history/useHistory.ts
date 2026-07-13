import { useEffect, useRef } from "react";
import { Document } from '../../db/models/documents/Documents';
import config from "../../../config";
import { DocumentHistoryController } from "./documentHistoryController";
import { rollbar } from "../../rollbar.ts";
import { sanitizeErrorForRollbar } from "../../utils/utils.ts";

const useHistory = (
  document: Document | undefined = undefined,
) => {
  const previousDocument = useRef<Document | undefined>(undefined);
  const startTime = useRef<Date | undefined>(undefined);

  useEffect(() => {
    checkViewTime();

    // Update values
    previousDocument.current = document ? Document.clone(document, { includeParent: true }) : undefined;

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

    try {
      // We just opened a document
      if (document?.uuid != currentPreviousDocument?.uuid) {
        startTime.current = new Date();
      }

      // Check for valid objects
      if (currentPreviousDocument == undefined) return;

      // Check for changes
      if (document?.uuid == currentPreviousDocument?.uuid) return;

      startTime.current = new Date();

      if (difference < config.documents.history.minViewTimeMs) return;

      try {
        DocumentHistoryController.pushDocument(currentPreviousDocument, undefined, difference);
      } catch (error) {
        rollbar.error("Failed to save verse history", sanitizeErrorForRollbar(error))
      }
    } catch (error) {
      rollbar.error("Failed to check view time", sanitizeErrorForRollbar(error))
    }
  }
}

export default useHistory;