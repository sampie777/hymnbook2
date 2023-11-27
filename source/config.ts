import Config from "react-native-config";

const config = {
  maxSearchInputLength: 4,
  maxSearchResultsLength: 200,
  defaultMelodyName: "Default",

  surveyMinimumAppOpenedTimes: 6,
  surveyDisplayInterval: 3,
  surveyUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeWBWzC8_M2BhY1HFmCBz03bRCYTkwpAUSL_8OtlGEJuQxCgg/viewform?usp=sf_link",

  feedbackUrl: "https://docs.google.com/forms/d/e/1FAIpQLSetqgPvuLh9K0m2nbonauXxrHiaFGpZz8_AUXOc9NcCpjnUUg/viewform?usp=sf_link",
  whatsappFeedbackGroupUrl: Config.WHATSAPP_USER_GROUP_LINK,
  homepage: "https://hymnbook.sajansen.nl#downloads",
  deepLinkPaths: [
    "https://hymnbook.sajansen.nl/",
    "hymnbook://"
  ],

  debugEmulators: [
    "8637e4d1b2d194bf761541144c9a7876", // local emulator API 33
  ],

  featuresWaitForDatabaseMaxTries: 10,

  authWaitForAuthenticationDelayMs: 500,
  authWaitForAuthenticationTimeoutMs: 60000,
  authReauthenticateMaxRetries: 3
};
export default config;
