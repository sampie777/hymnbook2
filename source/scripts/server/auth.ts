import Settings from "../settings";
import { api, throwErrorsIfNotOk } from "./api";
import { getUniqueId } from "react-native-device-info";
import { AccessRequestStatus } from "./models";
import { rollbar } from "../rollbar";

class AccessRequestResponse {
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

export class ServerAuth {
  static isAuthenticated(): boolean {
    return Settings.authJwt !== undefined && Settings.authJwt !== "";
  }

  static authenticate(): Promise<string> {
    if (Settings.authRequestId === "") {
      return this._requestAccess();
    } else if (Settings.authJwt === "") {
      return this._retrieveAccessJWT();
    } else {
      // Already authenticated
      return new Promise<string>(() => "");
    }
  }

  static getJwt(): string {
    if (!this.isAuthenticated()) {
      console.warn("Trying to get JWT but I'm not authenticated yet");
    }
    return Settings.authJwt;
  }

  static withJwt(callback: (jwt: string) => Promise<any>): Promise<any> {
    if (!Settings.useAuthentication) {
      return callback("");
    }

    if (this.isAuthenticated()) {
      return callback(this.getJwt());
    }

    return this.authenticate()
      .then(jwt => callback(jwt));
  }

  static forgetCredentials() {
    Settings.authJwt = "";
    Settings.authRequestId = "";
  }

  static _requestAccess(): Promise<string> {
    this.forgetCredentials();

    return api.auth.requestAccess(this._getDeviceId())
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then(data => {
        if (data.status === "error") {
          throw new Error(data.data);
        }

        const accessRequestResponse = data.content as AccessRequestResponse;
        Settings.authStatus = accessRequestResponse.status;
        Settings.authDeniedReason = accessRequestResponse.reason || "";
        Settings.store();

        if (accessRequestResponse.status === AccessRequestStatus.DENIED) {
          console.warn(`Access request is denied: ${accessRequestResponse.reason}`);
          return "";
        }

        if (accessRequestResponse.requestID == null || accessRequestResponse.requestID == "") {
          rollbar.error(`Access request for '${this._getDeviceId()}' requested but received no (valid) requestID but: '${accessRequestResponse.requestID}'`);
          return "";
        }

        Settings.authStatus = AccessRequestStatus.REQUESTED;
        Settings.authRequestId = accessRequestResponse.requestID || "";
        Settings.store();

        if (accessRequestResponse.status === AccessRequestStatus.APPROVED) {
          return this.authenticate();
        }
        return "";
      })
      .catch(error => {
        console.error(`Error requesting access token.`, error);
        throw error;
      });
  }

  static _retrieveAccessJWT(): Promise<string> {
    if (Settings.authRequestId == null || Settings.authRequestId === "") {
      rollbar.error("Cannot retrieve JWT if requestId is null or empty");
      return new Promise<string>(() => "");
    }

    return api.auth.retrieveAccess(this._getDeviceId(), Settings.authRequestId)
      .then(throwErrorsIfNotOk)
      .then(response => response.json())
      .then(data => {
        if (data.status === "error") {
          throw new Error(data.data);
        }

        const accessRequestResponse = data.content as AccessRequestResponse;
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
        console.error(`Error retrieving access token.`, error);
        throw error;
      });
  }

  static _getDeviceId(): string {
    if (Settings.authClientName === "") {
      Settings.authClientName = getUniqueId();
      Settings.store();
    }

    return Settings.authClientName;
  }
}
