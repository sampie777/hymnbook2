import Settings from "../../settings";
import { authApi } from "./authApi";
import { getUniqueId } from "react-native-device-info";
import { AccessRequestStatus, JsonResponse, JsonResponseType } from "./models";
import { rollbar } from "../rollbar";
import { HttpError, throwErrorsIfNotOk } from "../apiUtils";
import { emptyPromiseWithValue } from "../utils";

export class AccessRequestResponse {
  status: AccessRequestStatus;
  requestID: string | null;
  reason: string | null;
  jwt: string | null;

  constructor(status: AccessRequestStatus,
              requestID: string | null,
              reason: string | null,
              jwt: string | null
  ) {
    this.status = status;
    this.requestID = requestID;
    this.reason = reason;
    this.jwt = jwt;
  }
}

export namespace ServerAuth {
  export const isAuthenticated = (): boolean  => {
    return Settings.authJwt !== undefined && Settings.authJwt !== "";
  }

  export const authenticate = (): Promise<string>  => {
    if (Settings.authRequestId === undefined || Settings.authRequestId === "") {
      return _requestAccess();
    } else if (Settings.authJwt === undefined || Settings.authJwt === "") {
      return _retrieveAccessJWT();
    } else {
      // Already authenticated
      return emptyPromiseWithValue(getJwt());
    }
  }

  export const getJwt = (): string  => {
    if (!isAuthenticated()) {
      rollbar.warning("Trying to get JWT but I'm not authenticated yet");
    }
    return Settings.authJwt;
  }

  export const fetchWithJwt = (callback: (jwt: string) => Promise<Response>, resetAuthIfInvalidRetries: number = 1): Promise<Response>  => {
    if (!Settings.useAuthentication) {
      return callback("");
    }

    return authenticate()
      .then(jwt => callback(jwt))
      .then(response => {
        // After the request has been made, check if it was successful or if there was an authentication problem.

        if (resetAuthIfInvalidRetries <= 0) return response;
        if (!(response.status == 401 || response.status == 403)) return response;

        rollbar.info(`Resetting credentials due to authentication error`, {
          invalidJwt: getJwt(),
          httpStatus: response.status,
          url: response.url,
        });

        // Reset authentication to regain new rights and try again
        forgetCredentials();

        return fetchWithJwt(callback, resetAuthIfInvalidRetries - 1);
      });
  }

  export const forgetCredentials = ()  => {
    Settings.authJwt = "";
    Settings.authRequestId = "";
    Settings.authStatus = AccessRequestStatus.UNKNOWN;
  }

  export const _requestAccess = (): Promise<string>  => {
    forgetCredentials();

    return authApi.auth.requestAccess(getDeviceId())
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse<AccessRequestResponse>) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new Error(data.content);
        }

        const accessRequestResponse = data.content;
        Settings.authStatus = accessRequestResponse.status;
        Settings.authDeniedReason = accessRequestResponse.reason || "";
        Settings.store();

        if (accessRequestResponse.status === AccessRequestStatus.DENIED) {
          console.warn(`Access request is denied: ${accessRequestResponse.reason}`);
          return "";
        }

        if (accessRequestResponse.requestID == null || accessRequestResponse.requestID == "") {
          rollbar.error(`Access request for '${getDeviceId()}' requested but received no (valid) requestID but: '${accessRequestResponse.requestID}'`);
          return "";
        }

        Settings.authStatus = AccessRequestStatus.REQUESTED;
        Settings.authRequestId = accessRequestResponse.requestID || "";
        Settings.store();

        if (accessRequestResponse.status === AccessRequestStatus.APPROVED) {
          return authenticate();
        }
        return "";
      })
      .catch(error => {
        rollbar.error(`Error requesting access token.`, error);
        throw error;
      });
  }

  /**
   * Returns promise with <JWT string or empty if failed>
   */
  export const _retrieveAccessJWT = (): Promise<string>  => {
    if (Settings.authRequestId == null || Settings.authRequestId === "") {
      rollbar.error("Cannot retrieve JWT if requestId is null or empty");
      return emptyPromiseWithValue("");
    }

    return authApi.auth.retrieveAccess(getDeviceId(), Settings.authRequestId)
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then((data: JsonResponse<AccessRequestResponse>) => {
        if (data.type === JsonResponseType.ERROR) {
          throw new Error(data.content);
        }

        const accessRequestResponse = data.content;
        Settings.authStatus = accessRequestResponse.status;
        Settings.authDeniedReason = accessRequestResponse.reason || "";
        Settings.store();

        if (accessRequestResponse.status === AccessRequestStatus.DENIED) {
          console.warn(`Access request is denied: ${accessRequestResponse.reason}`);
          return "";
        }

        if (accessRequestResponse.status !== AccessRequestStatus.APPROVED) {
          return "";
        }

        if (accessRequestResponse.jwt == null) {
          rollbar.error(`Access request '${Settings.authRequestId}' approved but received no (valid) jwt but: '${accessRequestResponse.jwt}'`);
          return "";
        }

        Settings.authJwt = accessRequestResponse.jwt;
        Settings.store();

        return Settings.authJwt;
      })
      .catch(error => {
        rollbar.error(`Error retrieving access token.`, error);
        throw error;
      });
  }

  export const getDeviceId = (): string  => {
    if (Settings.authClientName === "") {
      Settings.authClientName = getUniqueId();
      Settings.store();
    }

    return Settings.authClientName;
  }
}
