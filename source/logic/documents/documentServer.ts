import { api } from "../api";
import { rollbar } from "../rollbar";
import { parseJscheduleResponse } from "../apiUtils";
import { DocumentGroup as ServerDocumentGroup, DocumentGroup } from "../server/models/Documents";

export namespace DocumentServer {
  export const fetchDocumentGroups = (includeOther: boolean = false): Promise<ServerDocumentGroup[]> => {
    return api.documents.groups.root()
      .then(r => parseJscheduleResponse<ServerDocumentGroup[]>(r))
      .then(groups => {
        if (!includeOther) {
          groups = groups.filter(it => it.name !== "Other");
        }

        return groups;
      })
      .catch(error => {
        rollbar.error(`Error fetching document groups`, {
          error: error,
          errorType: error.constructor.name,
          includeOther: includeOther
        });
        throw error;
      });
  };

  export const fetchDocumentGroupWithChildrenAndContent = (group: DocumentGroup): Promise<ServerDocumentGroup> => {
    return api.documents.groups.get(group.id, true, true, true)
      .then(r => parseJscheduleResponse<ServerDocumentGroup>(r))
      .catch(error => {
        rollbar.error(`Error fetching documents for document group`, {
          error: error,
          errorType: error.constructor.name,
          documentGroup: group
        });
        throw error;
      });
  };
}
