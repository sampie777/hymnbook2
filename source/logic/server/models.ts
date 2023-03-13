export enum AccessRequestStatus {
  UNKNOWN = "UNKNOWN",
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
}

export enum JsonResponseType {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

interface JsonErrorResponse<T> {
  type: JsonResponseType.ERROR;
  content: string | undefined;
}

interface JsonSuccessResponse<T> {
  type: JsonResponseType.SUCCESS;
  content: T;
}

export type JsonResponse<T> = JsonSuccessResponse<T> | JsonErrorResponse<T>;
