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
    "77975543a8268cd4", // local emulator
    "e110b2f6acc009ac", // Google emulator
    "e7693a312035bf94", // Google emulator
  ]
};
export default config;
