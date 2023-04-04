import { rollbar } from "./rollbar";

export class HttpError extends Error {
  name = "HttpError"
  response?: Response;

  constructor(message?: string, response?: Response) {
    super(message);
    this.response = response;
  }
}

export const throwErrorsIfNotOk = (response: Response) => {
  if (response.ok) {
    return response;
  }

  rollbar.error(`API request to '${response.url}' failed: (${response.status}) ${response.statusText}`);
  switch (response.status) {
    case 404:
      throw new HttpError(`Could not find the requested data: (${response.status}) ${response.statusText}`, response);
    case 401:
      throw new HttpError(`Could not retrieve the requested data: (${response.status}) Not authorized. \n\nGo to (advanced) settings and try to reset your authentication.`, response);
    case 403:
      throw new HttpError(`Could not retrieve the requested data: (${response.status}) Not authorized. \n\nGo to (advanced) settings and try to reset your authentication.`, response);
    case 410:
      throw new HttpError(`Server says resource is gone (${response.status}).\n\nTry again later.`, response);
    case 429:
      throw new HttpError(`Too many request (${response.status}).\n\nTake a break and try again later.`, response);
    case 500:
      throw new HttpError(`Could not connect to server: (${response.status}) Internal server error`, response);
    default:
      throw new HttpError(`Request failed: (${response.status}) ${response.statusText}`, response);
  }
};
