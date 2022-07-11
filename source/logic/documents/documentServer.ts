import { rollbar } from "../rollbar";
import { api, throwErrorsIfNotOk } from "../api";
import { Result } from "../utils";
import { JsonResponse, JsonResponseType } from "../server/models";
import { ServerAuth } from "../server/auth";
import { DocumentGroup } from "../server/models/Documents";

export namespace DocumentServer {
  export const fetchDocumentGroups = (includeOther: boolean = false, resetAuthOn403: boolean = true): Promise<Result> => {
    return api.documents.groups.root()
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new Error(data.content);
        }

        let groups: Array<DocumentGroup> = data.content;
        if (!includeOther) {
          groups = groups.filter(it => it.name !== "Other");
        }

        return new Result({ success: true, data: groups });
      })
      .catch((error: Error) => {
        if (resetAuthOn403 && error.message.includes("Not authorized.")) {
          // Reset authentication to regain new rights
          ServerAuth.forgetCredentials();
          rollbar.info("Resetting credentials due to HTTP 401/403 error when fetching documents");
          return fetchDocumentGroups(includeOther, false);
        }

        rollbar.error(`Error fetching document groups`, error);
        throw error;
      });
  };

  export const fetchDocumentGroupWithChildrenAndContent = (group: DocumentGroup): Promise<Result> => {
    return api.documents.groups.get(group.id, true, true, true)
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new Error(data.content);
        }

        return new Result({ success: true, data: data.content });
      })
      .catch(error => {
        rollbar.error(`Error fetching documents for document group ${group.name}`, error);
        throw error;
      });
  };
}
