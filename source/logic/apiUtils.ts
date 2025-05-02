import { rollbar } from "./rollbar";
import { JsonResponse, JsonResponseType } from "./server/models";
import { sanitizeErrorForRollbar } from "./utils";

export const HttpCode = {
  Ok: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Gone: 410,
  Im_a_teapot: 418,
  PageExpired: 419,
  UnprocessableContent: 422,
  FailedDependency: 424,
  TooManyRequests: 429,
  InternalServerError: 500
};

export class HttpError extends Error {
  name = "HttpError";
  response?: Response;

  constructor(message?: string, response?: Response) {
    super(message);
    this.response = response;
  }
}

export class BackendError extends HttpError {
  name = "BackendError";

  constructor(message?: string, response?: Response) {
    super(message, response);
  }
}

export const isConnectionError = (error: any) =>
  error instanceof Error && error.name == "TypeError" && error.message == "Network request failed"

export const throwIfConnectionError = (error: any) => {
  if (isConnectionError(error)) {
    throw error;
  }
}

const responseStatusToText = (response: Response): string => {
  if (response.statusText && response.statusText.length > 0) return response.statusText;
  const httpCodePair = Object.entries(HttpCode).find(([key, value]) => value === response.status);
  if (httpCodePair) return httpCodePair[0];
  return "";
};

const obtainResponseContent = <T>(response: Response): Promise<string | T | null> => {
  const contentType = response.headers.get("content-type");
  if (contentType?.startsWith("application/json")) return response.json().catch(error => {
    rollbar.error("Could not convert response to json", sanitizeErrorForRollbar(error));
    return null;
  });
  return response.text().catch(error => {
    rollbar.error("Could not convert response to text", sanitizeErrorForRollbar(error));
    return null;
  });
};

const getErrorForResponse = (response: Response, data?: any, customErrorMessage?: string): Error => {
  let serverResponseAsText = customErrorMessage ?? "";
  serverResponseAsText += ` (${response.status} ${responseStatusToText(response)})`;
  serverResponseAsText = serverResponseAsText.trim();

  rollbar.error(`API request failed`, {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    response: response,
    content: data,
    serverResponseAsText: serverResponseAsText
  });

  const ErrorClass = data && data.type && data.type === JsonResponseType.ERROR ? BackendError : HttpError;

  switch (response.status) {
    case HttpCode.NotFound:
      return new ErrorClass(`Could not find the requested data. ${serverResponseAsText}`, response);
    case HttpCode.Unauthorized:
      return new ErrorClass(`Could not retrieve the requested data. ${serverResponseAsText}.\n\nGo to (advanced) settings and try to reset your authentication.`, response);
    case HttpCode.Forbidden:
      return new ErrorClass(`Could not retrieve the requested data. ${serverResponseAsText}.\n\nGo to (advanced) settings and try to reset your authentication.`, response);
    case HttpCode.Gone:
      return new ErrorClass(`Server says resource is gone (${response.status}).\n\nTry again later.`, response);
    case HttpCode.TooManyRequests:
      return new ErrorClass(`Too many request (${response.status}).\n\nTake a break and try again later.`, response);
    case HttpCode.InternalServerError:
      return new ErrorClass(`Could not connect to server. ${serverResponseAsText}`, response);
    default:
      return new ErrorClass(`Request failed. ${serverResponseAsText}`, response);
  }
};

export const parseJscheduleResponse = <T>(response: Response): Promise<T> =>
  obtainResponseContent<JsonResponse<T>>(response)
    .then(data => {
      if (response.ok && typeof data === "object" && data !== null && data.type == JsonResponseType.SUCCESS)
        return data.content;

      // Else throw error based on status code and include response

      let serverResponseAsText = "";
      if (data !== null && typeof data === "object") {
        if (typeof data.content === "string") {
          serverResponseAsText = data.content;
        } else {
          serverResponseAsText = JSON.stringify(data.content);
        }
      } else if (data !== null) {
        serverResponseAsText = data;
      }

      throw getErrorForResponse(response, data, serverResponseAsText);
    });

export const parseHymnbookResponse = <T>(response: Response): Promise<T> =>
  obtainResponseContent<T>(response)
    .then(data => {
      if (response.ok && data !== null)
        return data as T;

      // Else throw error based on status code and include response

      let serverResponseAsText = "";
      if (data !== null && typeof data === "string") {
        serverResponseAsText = data;
      } else if (data !== null) {
        serverResponseAsText = JSON.stringify(data);
      }

      throw getErrorForResponse(response, data, serverResponseAsText);
    });
