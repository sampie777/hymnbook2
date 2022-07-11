import { Platform } from "react-native";
import { Client, Configuration } from "rollbar-react-native";
import { getUniqueId, getVersion } from "react-native-device-info";
import Config from "react-native-config";
import config from "../config";

const configuration = new Configuration(
  Config.ROLLBAR_API_KEY,
  {
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: !config.debugEmulators.includes(getUniqueId()),
    verbose: true,
    payload: {
      environment: process.env.NODE_ENV,
      client: {
        javascript: {
          source_map_enabled: true,
          code_version: getVersion() + "." + Platform.OS,
        }
      },
      person: {
        id: getUniqueId(),
      }
    },
  });

export const rollbar = new Client(configuration);
