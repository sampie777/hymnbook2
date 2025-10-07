module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ["@babel/plugin-transform-export-namespace-from", { loose: true }],
    ["@babel/plugin-transform-flow-strip-types", { loose: true }],
    ["@babel/plugin-transform-class-properties", { loose: true }],
    ["@babel/plugin-transform-private-methods", { loose: true }],
    "@babel/plugin-transform-unicode-property-regex",
    "react-native-reanimated/plugin",
  ],
};
