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

jest.mock("./source/scripts/rollbar", () => {
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
