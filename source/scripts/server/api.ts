import Settings from "../settings";

const apiHostUrl = Settings.songBundlesApiUrl;
const apiBaseUrl = `${apiHostUrl}/api/v1`;

const post = (url: string, data: any = "") =>
  fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    // mode: 'no-cors',
    body: JSON.stringify(data)
  });

// eslint-disable-next-line no-unused-vars
export const throwErrorsIfNotOk = (response: Response) => {
  if (response.ok) {
    return response;
  }
  switch (response.status) {
    case 404:
      throw Error(`Could not connect to server: (${response.status}) ${response.statusText}`);
    case 401:
      throw Error(`Could not connect to server: (${response.status}) Not authorized. Go to (advanced) settings and reset your authentication.`);
    case 500:
      throw Error(`Could not connect to server: (${response.status}) Internal server error`);
    default:
      throw Error(`Request failed: (${response.status}) ${response.statusText}`);
  }
};

export const api = {
  auth: {
    requestAccess: (clientName: string) =>
      post(`${apiBaseUrl}/auth/application/request-access/hymnbook?clientName=${clientName}`, ""),
    retrieveAccess: (clientName: string, requestId: string) =>
      post(`${apiBaseUrl}/auth/application/request-access/hymnbook?clientName=${clientName}&requestID=${requestId}`, "")
  }
};
