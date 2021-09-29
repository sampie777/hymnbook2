import { Client, Configuration } from "rollbar-react-native";
import { getVersion } from "react-native-device-info";

const configuration = new Configuration(
  "abf5a622224c49b9956d9daae28affbb",
  {
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: "development",
      client: {
        javascript: {
          source_map_enabled: true,
          code_version: getVersion(),
          environment: 'production'
        }
      }
    },
    verbose: true,
    enabled: true //todo: set this to true for production
  });

export const rollbar = new Client(configuration);
