import Settings from "../settings";
import config from "../config";
import { Security } from "./security";
import { rollbar } from "./rollbar";

export namespace Survey {
  export const url = () => {
    if (Security.getDeviceId().trim().length == 0) {
      rollbar.error("Got empty device ID while creating survey url", {
        getDeviceId: Security.getDeviceId()
      });
    }
    return `https://hymnbook.sajansen.nl/api/v1/feedback/features/register?user=${Security.getDeviceId()}`;
  };

  export const needToShow = (date = new Date()) => {
    const isDuringSundayService = date.getDay() === 0 &&
      (
        (date.getHours() >= 8 && date.getHours() < 12) ||
        (date.getHours() >= 16 && date.getHours() < 20)
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
