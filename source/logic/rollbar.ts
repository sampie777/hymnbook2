import { Platform } from "react-native";
import { Callback, Client, Extra, LogArgument, LogResult } from "rollbar-react-native";
import { getVersion } from "react-native-device-info";
import Config from "react-native-config";
import { Security } from "./security";
import config from "../config";


export const rollbar = new Client({
  accessToken: Config.ROLLBAR_API_KEY || "",
  captureUncaught: true,
  captureUnhandledRejections: true,
  enabled: process.env.NODE_ENV !== "development",
  verbose: true,
  payload: {
    environment: process.env.NODE_ENV,
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: getVersion() + "." + Platform.OS
      }
    }
  },
  captureDeviceInfo: true
});

export const rollbarInit = () =>
  Security.init()
    .catch(e => rollbar.error("Could not init security", { error: e }))
    .then(() => {
      rollbar.setPerson(Security.getDeviceId());
      checkShouldRollbarBeEnabled(Security.getDeviceId());
    })
    .catch(e => rollbar.error("Could not get unique ID", { error: e }));

export const checkShouldRollbarBeEnabled = (uniqueId: string | null = Security.getDeviceId()) => {
  const shouldRollbarBeEnabled = uniqueId != null
    && uniqueId.length > 0
    && !config.debugEmulators.includes(uniqueId)
    && process.env.NODE_ENV !== "development";

  if (shouldRollbarBeEnabled) return;
  disableRollbar(uniqueId);
};

export const disableRollbar = (uniqueId: string | null = Security.getDeviceId()) => {
  console.debug("Rollbar is disabled", { client: uniqueId, env: process.env.NODE_ENV });

  const rollbarLogLocal = (logFunction: (...data: any[]) => void, obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => {
    if (extra === undefined) logFunction(obj);
    else logFunction(obj, extra);

    callback?.(null, {});
    return { uuid: "" };
  };

  rollbar.log = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.log, obj, extra, callback);
  rollbar.debug = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.debug, obj, extra, callback);
  rollbar.info = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.info, obj, extra, callback);
  rollbar.warning = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.warn, obj, extra, callback);
  rollbar.error = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.error, obj, extra, callback);
  rollbar.critical = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.error, obj, extra, callback);
};

checkShouldRollbarBeEnabled("unknown");