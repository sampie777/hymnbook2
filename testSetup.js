jest.mock("rollbar-react-native");
jest.mock("react-native-device-info", () => {
  return {
    getVersion: () => 1,
  }
});
