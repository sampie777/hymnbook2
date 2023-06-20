import Config from "react-native-config";

const config = {
  maxSearchInputLength: 4,
  maxSearchResultsLength: 200,
  defaultMelodyName: "Default",

  surveyMinimumAppOpenedTimes: 6,
  surveyDisplayInterval: 4,
  surveyUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeWBWzC8_M2BhY1HFmCBz03bRCYTkwpAUSL_8OtlGEJuQxCgg/viewform?usp=sf_link",

  feedbackUrl: "https://docs.google.com/forms/d/e/1FAIpQLSetqgPvuLh9K0m2nbonauXxrHiaFGpZz8_AUXOc9NcCpjnUUg/viewform?usp=sf_link",
  whatsappFeedbackGroupUrl: Config.WHATSAPP_USER_GROUP_LINK,
  homepage: "https://hymnbook.sajansen.nl#downloads",

  debugEmulators: [
    "77975543a8268cd4", // local emulator API 30
    "120835e8ccec39a3", // local emulator API 33
    "e110b2f6acc009ac", // Google emulator
    "e7693a312035bf94", // Google emulator
    "ec0b076b8397becd", // Google emulator
    "9d4277527765d82d", // Google emulator
    "8d717ac3e266c34f", // Google emulator
    "2ccff82ad9ae4db9", // Google emulator
    "16bcab84bceb3951", // Google emulator
    "2ccff82ad9ae4db9", // Google emulator
    "a53edad31d1fc2a6", // Google emulator
    "fd60376dc45eccfa", // Google emulator
    "21d139f8198cab09", // Google emulator
    "c3e345bfb9baedd9", // Google emulator
    "21d139f8198cab09", // Google emulator
    "fd60376dc45eccfa", // Google emulator
    "830149ae5d1a7810", // Google emulator
    "c3e345bfb9baedd9", // Google emulator
    "25fe8f559df268ed", // Google emulator
    "7a73164ba4dd3e6d", // Google emulator
    "fe3fc5a8b8ddbb83", // Google emulator
    "3a71976eb868632b", // Google emulator
    "b534682214912d2b", // Google emulator
    "bc632a4839066590", // Google emulator
    "86f801c52e501cda", // Google emulator
    "55977ff9d8e98eff", // Google emulator
    "92ca931d4902fe2a", // Google emulator
    "ccb588f59fc353b7", // Google emulator
    "7150a8ec2be97954", // Google emulator
    "d80b7ba66c87b72f", // Google emulator
    "bcedc1583abdaf37", // Google emulator
    "4d1bcf73ab062899", // Google emulator
    "4b1ee687836a55e7", // Google emulator
    "d118dc20948b65fa", // Google emulator
    "0fc5d01bc0c15952", // Google emulator
    "22e089cdffd51c78", // Google emulator
    "b4b7db65fac66cb6", // Google emulator
    "6545e593901dc68d", // Google emulator
    "34b8f2f060550907", // Google emulator
    "ba24eb96892a3e6c", // Google emulator
    "165c00b702e87e5b", // Google emulator
    "15a880ae841139ad", // Google emulator
    "e6e7abf681c43f3b", // Google emulator
    "4b1ee687836a55e7", // Google emulator
    "c43bdc1c23eadcb5", // Google emulator
    "d118dc20948b65fa", // Google emulator
    "2E13AB6A-D14B-40ED-A016-C92FEA3B0C90", // iOS emulator
    "6487ff1a70800dd4", // Google emulator
    "f19a054707669a32", // Google emulator
    "70a2b46739f73529", // Google emulator
    "528e7f47a9193cb2", // Google emulator
    "fd34fb8091942548", // Google emulator
    "fe0545de25287c82" // Google emulator
  ],

  featuresWaitForDatabaseMaxTries: 10,

  authWaitForAuthenticationDelayMs: 500,
  authWaitForAuthenticationTimeoutMs: 60000,
  authReauthenticateMaxRetries: 3
};
export default config;
