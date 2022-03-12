import { Client, Configuration } from "rollbar-react-native";
import { getUniqueId, getVersion } from "react-native-device-info";
import Config from "react-native-config";

const configuration = new Configuration(
  Config.ROLLBAR_API_KEY,
  {
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: process.env.NODE_ENV === "production",
    verbose: true,
    payload: {
      environment: process.env.NODE_ENV,
      client: {
        javascript: {
          source_map_enabled: true,
          code_version: getVersion(),
        }
      },
      person: {
        id: getUniqueId(),
      }
    },
  });

export const rollbar = new Client(configuration);
