module.exports = {
  preset: "react-native",
  verbose: true,
  setupFiles: [
    "<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js",
    "<rootDir>/testSetup.js",
  ],
  transformIgnorePatterns: [
    "node_modules/?!(rollbar-react-native)",
  ],
};
