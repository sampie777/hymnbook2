import Settings from "../settings";
import config from "../config";

export namespace Survey {
  export const url = () => {
    return config.surveyUrl;
  };

  export const needToShow = (date = new Date()) => {
    const isDuringSundayService = date.getDay() === 0 &&
      (
        (date.getHours() >= 9 && date.getHours() < 12) ||
        (date.getHours() >= 18 && date.getHours() < 20)
      );
    return mayBeShown() &&
      (Settings.appOpenedTimes - config.surveyMinimumAppOpenedTimes) % config.surveyDisplayInterval === 0 &&
      !isDuringSundayService;
  };

  export const mayBeShown = () => !isCompleted() && Settings.appOpenedTimes >= config.surveyMinimumAppOpenedTimes;

  export const isCompleted = () => Settings.surveyCompleted;

  export const complete = () => {
    Settings.surveyCompleted = true;
    Settings.store();
  };
}
