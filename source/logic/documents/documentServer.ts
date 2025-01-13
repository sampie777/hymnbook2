import { api } from "../api";
import { rollbar } from "../rollbar";
import { parseJscheduleResponse, throwIfConnectionError } from "../apiUtils";
import {
  DocumentGroup as ServerDocumentGroup,
  ServerDocumentGroupUpdateStatus
} from "../server/models/Documents";
import { sanitizeErrorForRollbar } from "../utils";

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
        throwIfConnectionError(error);

        rollbar.error(`Error fetching document groups`, {
          ...sanitizeErrorForRollbar(error),
          includeOther: includeOther
        });
        throw error;
      });
  };

  export const fetchDocumentGroupUpdates = (): Promise<ServerDocumentGroupUpdateStatus[]> =>
    api.documents.groups.updates()
      .then(r => parseJscheduleResponse<ServerDocumentGroupUpdateStatus[]>(r))
      .catch(error => {
        throwIfConnectionError(error);

        rollbar.error(`Error fetching document group update status`, {
          ...sanitizeErrorForRollbar(error),
        });
        throw error;
      });

  export const fetchDocumentGroup = (group: { uuid: string }, {
    loadGroups = false,
    loadItems = false,
    loadContent = false
  }): Promise<ServerDocumentGroup> => {
    return api.documents.groups.get(group.uuid, loadGroups, loadItems, loadContent)
      .then(r => parseJscheduleResponse<ServerDocumentGroup>(r))
      .catch(error => {
        throwIfConnectionError(error);

        rollbar.error(`Error fetching document group`, {
          ...sanitizeErrorForRollbar(error),
          documentGroup: group,
          loadGroups: loadGroups,
          loadItems: loadItems,
          loadContent: loadContent
        });
        throw error;
      });
  };

  export const fetchDocumentGroupWithChildrenAndContent = (group: { uuid: string }): Promise<ServerDocumentGroup> =>
    fetchDocumentGroup(group, {
      loadGroups: true,
      loadItems: true,
      loadContent: true
    });
}
