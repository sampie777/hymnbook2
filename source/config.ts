import Config from "react-native-config";

const config = {
  maxSearchInputLength: 4,
  maxSearchResultsLength: 200,

  surveyMinimumAppOpenedTimes: 6,
  surveyDisplayInterval: 4,
  surveyUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeWBWzC8_M2BhY1HFmCBz03bRCYTkwpAUSL_8OtlGEJuQxCgg/viewform?usp=sf_link",

  feedbackUrl: "https://docs.google.com/forms/d/e/1FAIpQLSetqgPvuLh9K0m2nbonauXxrHiaFGpZz8_AUXOc9NcCpjnUUg/viewform?usp=sf_link",
  whatsappFeedbackGroupUrl: Config.WHATSAPP_USER_GROUP_LINK,

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
  ],

  featuresWaitForDatabaseMaxTries: 10,
};
export default config;
