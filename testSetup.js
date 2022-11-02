import mockClipboard from "@react-native-clipboard/clipboard/jest/clipboard-mock.js";
import Db from "./source/logic/db/db";

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

jest.mock("hymnbook2/source/logic/db/db");
Db.songs.getIncrementedPrimaryKey.mockImplementation(() => 1);
Db.songs.realm.mockImplementation(() => {
  return {
    objects: () => [],
    write: (callback) => callback ? callback() : undefined,
    create: () => undefined,
    delete: () => undefined,
  };
});
