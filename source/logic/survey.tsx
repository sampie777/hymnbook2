import Settings from "../settings";
import config from "../config";

export class Survey {
  static url() {
    return config.surveyUrl;
  }

  static needToShow() {
    return !Settings.surveyCompleted &&
      Settings.appOpenedTimes >= config.surveyMinimumAppOpenedTimes &&
      (Settings.appOpenedTimes - config.surveyMinimumAppOpenedTimes) % config.surveyDisplayInterval === 0;
  }

  static complete() {
    Settings.surveyCompleted = true;
    Settings.store();
  }
}
