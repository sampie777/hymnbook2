import Settings from "../settings";
import config from "../config";

export class Survey {
  static url() {
    return config.surveyUrl;
  }

  static needToShow(date = new Date()) {
    const isDuringSundayService = date.getDay() === 0 &&
      (
        (date.getHours() >= 9 && date.getHours() < 12) ||
        (date.getHours() >= 18 && date.getHours() < 20)
      );
    return !Settings.surveyCompleted &&
      Settings.appOpenedTimes >= config.surveyMinimumAppOpenedTimes &&
      (Settings.appOpenedTimes - config.surveyMinimumAppOpenedTimes) % config.surveyDisplayInterval === 0 &&
      !isDuringSundayService;
  }

  static complete() {
    Settings.surveyCompleted = true;
    Settings.store();
  }
}
