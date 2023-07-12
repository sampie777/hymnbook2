import { rollbar } from "../rollbar";
import { api } from "../api";
import { throwErrorsIfNotOk } from "../apiUtils";
import { Result } from "../utils";
import { JsonResponse, JsonResponseType } from "../server/models";
import { DocumentGroup as ServerDocumentGroup, DocumentGroup } from "../server/models/Documents";
import { BackendError } from "../server/server";

export namespace DocumentServer {
  export const fetchDocumentGroups = (includeOther: boolean = false): Promise<Result<Array<ServerDocumentGroup>>> => {
    return api.documents.groups.root()
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse<DocumentGroup[]>) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new BackendError("Server response is of error type", data);
        }

        let groups = data.content;
        if (!includeOther) {
          groups = groups.filter(it => it.name !== "Other");
        }

        return new Result({ success: true, data: groups });
      })
      .catch((error: Error) => {
        rollbar.error(`Error fetching document groups`, {
          error: error,
          errorType: error.constructor.name,
          includeOther: includeOther
        });
        throw error;
      });
  };

  export const fetchDocumentGroup = (group: DocumentGroup | { uuid: string }, {
    loadGroups = false,
    loadItems = false,
    loadContent = false
  }): Promise<Result<ServerDocumentGroup>> => {
    return api.documents.groups.get(group.uuid, loadGroups, loadItems, loadContent)
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse<DocumentGroup>) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new BackendError("Server response is of error type", data);
        }

        return new Result({ success: true, data: data.content });
      })
      .catch(error => {
        rollbar.error(`Error fetching document group`, {
          error: error,
          errorType: error.constructor.name,
          documentGroup: group,
          loadGroups: loadGroups,
          loadItems: loadItems,
          loadContent: loadContent
        });
        throw error;
      });
  };

  export const fetchDocumentGroupWithChildrenAndContent = (group: DocumentGroup): Promise<Result<ServerDocumentGroup>> =>
    fetchDocumentGroup(group, {
      loadGroups: true,
      loadItems: true,
      loadContent: true
    });
}
