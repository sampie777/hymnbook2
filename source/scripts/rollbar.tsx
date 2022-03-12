import { Client, Configuration } from "rollbar-react-native";
import { getUniqueId, getVersion } from "react-native-device-info";

const configuration = new Configuration(
  "abf5a622224c49b9956d9daae28affbb",
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
