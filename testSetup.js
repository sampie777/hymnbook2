import mockClipboard from "@react-native-clipboard/clipboard/jest/clipboard-mock.js";

jest.mock("rollbar-react-native", () => {
  return {
    Configuration: () => undefined,
    Client: () => {
      return {
        log: () => undefined,
        debug: () => undefined,
        info: () => undefined,
        warning: () => undefined,
        error: () => undefined,
        critical: () => undefined,
      };
    },
  };
});

jest.mock("./source/logic/rollbar", () => {
  return {
    rollbar: {
      log: () => undefined,
      debug: () => undefined,
      info: () => undefined,
      warning: () => undefined,
      error: () => undefined,
      critical: () => undefined,
    },
  };
});

jest.mock("react-native-device-info", () => {
  return {
    getVersion: () => 1,
  };
});

jest.mock("@react-native-clipboard/clipboard", () => mockClipboard);
