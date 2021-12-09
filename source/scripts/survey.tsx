import Settings from "../settings";

export class Survey {
  static url() {
    return "https://docs.google.com/forms/d/e/1FAIpQLSeWBWzC8_M2BhY1HFmCBz03bRCYTkwpAUSL_8OtlGEJuQxCgg/viewform?usp=sf_link";
  }

  static needToShow() {
    return !Settings.surveyCompleted && Settings.appOpenedTimes > 4 && Settings.appOpenedTimes % 4 === 0;
  }

  static complete() {
    Settings.surveyCompleted = true;
    Settings.store()
  }
}
