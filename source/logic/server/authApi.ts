import { databaseHost } from "../../../app.json";
import { retryFetch } from "../api";

const authEndpoint = `${databaseHost}/api/v1`;

const post = (url: string, data: any = "") =>
  retryFetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

export const authApi = {
  auth: {
    requestAccess: (clientName: string) =>
      post(`${authEndpoint}/auth/application/request-access/hymnbook?clientName=${clientName}`, ""),
    retrieveAccess: (clientName: string, requestId: string) =>
      post(`${authEndpoint}/auth/application/request-access/hymnbook?clientName=${clientName}&requestID=${requestId}`, "")
  }
};
