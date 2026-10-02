import { api } from "../api";
import { rollbar } from "../rollbar";
import { parseJscheduleResponse, throwIfConnectionError } from "../apiUtils";
import { DocumentGroup as ServerDocumentGroup, ServerDocumentGroupUpdateStatus } from "../server/models/Documents";
import { sanitizeErrorForRollbar } from "../utils/utils.ts";

export namespace DocumentServer {
  const documentGroupsCache: Map<string, ServerDocumentGroup> = new Map();

  export const getCachedDocumentGroup = (uuid: string): ServerDocumentGroup | undefined => {
    return documentGroupsCache.get(uuid);
  };

  export const setDocumentGroupsCache = (groups: ServerDocumentGroup[]) => {
    groups.forEach(it => {
      if (it.uuid) documentGroupsCache.set(it.uuid, it);
    });
  };

  export const clearDocumentGroupsCache = () => {
    documentGroupsCache.clear();
  };

  export const fetchDocumentGroups = (includeOther: boolean = false): Promise<ServerDocumentGroup[]> => {
    return api.documents.groups.root()
      .then(r => parseJscheduleResponse<ServerDocumentGroup[]>(r))
      .then(groups => {
        if (!includeOther) {
          groups = groups.filter(it => it.name !== "Other");
        }

        setDocumentGroupsCache(groups);
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
    if (!loadGroups && !loadItems && !loadContent) {
      const cached = documentGroupsCache.get(group.uuid);
      if (cached) {
        return Promise.resolve(cached);
      }
    }

    return api.documents.groups.get(group.uuid, loadGroups, loadItems, loadContent)
      .then(r => parseJscheduleResponse<ServerDocumentGroup>(r))
      .then(result => {
        if (result && result.uuid) {
          documentGroupsCache.set(result.uuid, result);
        }
        return result;
      })
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
