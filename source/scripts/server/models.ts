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

export interface JsonResponse {
  content: any | null;
  type: JsonResponseType;
}
