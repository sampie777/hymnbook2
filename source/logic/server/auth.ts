import Settings from "../../settings";
import { Security } from "../security";
import { authApi } from "./authApi";
import { AccessRequestStatus } from "./models";
import { rollbar } from "../rollbar";
import { HttpCode, HttpError, parseJscheduleResponse } from "../apiUtils";
import { emptyPromise, emptyPromiseWithValue, sanitizeErrorForRollbar } from "../utils";
import config from "../../config";

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
  let _isAuthenticating = false;

  export const isAuthenticated = (): boolean => {
    return Settings.authJwt !== undefined && Settings.authJwt !== "";
  };

  export const authenticate = (): Promise<string> => {
    _isAuthenticating = true;

    let authenticationProcess;
    if (Settings.authRequestId === undefined || Settings.authRequestId === "") {
      authenticationProcess = _requestAccess();
    } else if (Settings.authJwt === undefined || Settings.authJwt === "") {
      authenticationProcess = _retrieveAccessJWT();
    } else {
      // Already authenticated
      authenticationProcess = emptyPromiseWithValue(getJwt());
    }

    return authenticationProcess
      .finally(() => {
        _isAuthenticating = false;
      });
  };

  export const getJwt = (): string => {
    if (!isAuthenticated()) {
      rollbar.info("Trying to get JWT but I'm not authenticated yet");
    }
    return Settings.authJwt;
  };

  export const forgetCredentials = () => {
    Settings.authJwt = "";
    Settings.authRequestId = "";
    Settings.authStatus = AccessRequestStatus.UNKNOWN;
  };

  const reAuthenticate = (reason: any) => {
    if (_isAuthenticating) {
      rollbar.info("Can't reauthenticate, as it is still/already authenticating", {
        reason: reason,
        isAuthenticating: _isAuthenticating,
        authJwt: Settings.authJwt,
        authRequestId: Settings.authRequestId,
        authStatus: Settings.authStatus
      });
      return emptyPromise();
    }

    rollbar.info(`Resetting credentials due to authentication error`, {
      invalidJwt: getJwt(),
      reason: reason,
      isAuthenticating: _isAuthenticating
    });

    // Reset authentication to regain new rights and try again
    forgetCredentials();

    return authenticate();
  };

  export const _requestAccess = (): Promise<string> => {
    forgetCredentials();

    return authApi.auth.requestAccess(getDeviceId())
      .then(r => parseJscheduleResponse<AccessRequestResponse>(r))
      .then(accessRequestResponse => {
        Settings.authStatus = accessRequestResponse.status;
        Settings.authDeniedReason = accessRequestResponse.reason || "";
        Settings.store();

        if (accessRequestResponse.status === AccessRequestStatus.DENIED) {
          console.info(`Access request is denied: ${accessRequestResponse.reason}`);
          return "";
        }

        if (accessRequestResponse.requestID == null || accessRequestResponse.requestID == "") {
          rollbar.error(`Access request requested but received no (valid) requestID`, {
            deviceId: getDeviceId(),
            response: accessRequestResponse
          });
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
        rollbar.error(`Error requesting access token.`, sanitizeErrorForRollbar(error));
        if (error.toString().includes("Too many request")) {
          throw new HttpError(`You're trying to authenticate way too often. Take a break and try again later.`);
        }
        throw error;
      });
  };

  /**
   * Returns promise with <JWT string or empty if failed>
   */
  export const _retrieveAccessJWT = (): Promise<string> => {
    if (Settings.authRequestId == null || Settings.authRequestId === "") {
      rollbar.error("Cannot retrieve JWT if requestId is null or empty");
      return emptyPromiseWithValue("");
    }

    return authApi.auth.retrieveAccess(getDeviceId(), Settings.authRequestId)
      .then(r => parseJscheduleResponse<AccessRequestResponse>(r))
      .then(accessRequestResponse => {
        Settings.authStatus = accessRequestResponse.status;
        Settings.authDeniedReason = accessRequestResponse.reason || "";
        Settings.store();

        if (accessRequestResponse.status === AccessRequestStatus.DENIED) {
          console.info(`Access request is denied: ${accessRequestResponse.reason}`);
          return "";
        }

        if (accessRequestResponse.status !== AccessRequestStatus.APPROVED) {
          return "";
        }

        if (accessRequestResponse.jwt == null) {
          rollbar.error(`Access request approved but received no (valid) jwt`, {
            authRequestId: Settings.authRequestId,
            response: accessRequestResponse.jwt,
          });
          return "";
        }

        Settings.authJwt = accessRequestResponse.jwt;
        Settings.store();

        return Settings.authJwt;
      })
      .catch(error => {
        rollbar.error(`Error retrieving access token.`, sanitizeErrorForRollbar(error));
        if (error.toString().includes("resource is gone")) {
          throw new HttpError(`You've already completed authentication. If not, go to Advanced Settings and reset authentication.`);
        }
        throw error;
      });
  };

  export const getDeviceId = (): string => {
    if (Settings.authClientName === "") {
      Settings.authClientName = Security.getDeviceId();
      Settings.store();
    }

    return Settings.authClientName;
  };

  export const fetchWithJwt = (callback: (jwt: string) => Promise<Response>,
                               resetAuthIfInvalidRetries: number = config.authReauthenticateMaxRetries,
                               maxWaitForAuthRetries: number = config.authWaitForAuthenticationTimeoutMs / config.authWaitForAuthenticationDelayMs): Promise<Response> => {

    // If still busy authenticating, wait for authentication process to complete
    if (_isAuthenticating) {
      if (maxWaitForAuthRetries <= 0) {
        rollbar.error("Waiting for authentication to finish has timed out", {
          authWaitForAuthenticationTimeoutMs: config.authWaitForAuthenticationTimeoutMs,
          authWaitForAuthenticationDelayMs: config.authWaitForAuthenticationDelayMs,
          maxWaitForAuthRetries: maxWaitForAuthRetries,
          authReauthenticateMaxRetries: config.authReauthenticateMaxRetries,
          resetAuthIfInvalidRetries: resetAuthIfInvalidRetries,
          isAuthenticating: _isAuthenticating,
          authJwt: Settings.authJwt,
          authRequestId: Settings.authRequestId,
          authStatus: Settings.authStatus
        });
      }

      return new Promise((resolve => setTimeout(() =>
          resolve(
            fetchWithJwt(callback, resetAuthIfInvalidRetries, maxWaitForAuthRetries - 1)
          ),
        config.authWaitForAuthenticationDelayMs
      )));
    }

    if (maxWaitForAuthRetries < 0) {
      rollbar.debug("Waiting for authentication took too long", {
        authWaitForAuthenticationTimeoutMs: config.authWaitForAuthenticationTimeoutMs,
        authWaitForAuthenticationDelayMs: config.authWaitForAuthenticationDelayMs,
        maxWaitForAuthRetries: maxWaitForAuthRetries,
        authReauthenticateMaxRetries: config.authReauthenticateMaxRetries,
        resetAuthIfInvalidRetries: resetAuthIfInvalidRetries,
        isAuthenticating: _isAuthenticating,
        authJwt: Settings.authJwt,
        authRequestId: Settings.authRequestId,
        authStatus: Settings.authStatus
      });
    }

    return callback(getJwt())
      .then(response => {
        // After the request has been made, check if it was successful or if there was an authentication problem.

        if (resetAuthIfInvalidRetries <= 0) return response;
        if (!(response.status == HttpCode.Unauthorized || response.status == HttpCode.Forbidden)) return response;

        // Re authenticate and try again
        return reAuthenticate({
          httpStatus: response.status,
          url: response.url
        })
          .then(() => fetchWithJwt(callback, resetAuthIfInvalidRetries - 1, maxWaitForAuthRetries));
      });
  };
}
