import Settings from "../../source/settings";
import { Survey } from "../../source/logic/survey";
import config from "../../source/config";

describe("test survey", () => {
  it("needs to show when multiple of displayInterval and greater or equal to minimumOpenedTimes", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + config.surveyDisplayInterval;

    expect(Survey.needToShow()).toBe(true);
  });
  it("needs to show when multiple of 4 but greater than 4 (2)", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + 3 * config.surveyDisplayInterval;

    expect(Survey.needToShow()).toBe(true);
  });
  it("needs not to show when less than minimumOpenedTimes", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 0;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when less than minimumOpenedTimes (2)", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 1;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when less than minimumOpenedTimes", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes - 1;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when not multiple of displayInterval", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + 1.5 * config.surveyDisplayInterval;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when already completed", () => {
    Settings.surveyCompleted = true;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + config.surveyDisplayInterval;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when already completed or less than minimumOpenedTimes", () => {
    Settings.surveyCompleted = true;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes - 1;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when already completed or less than minimumOpenedTimes", () => {
    Settings.surveyCompleted = true;
    Settings.appOpenedTimes = 0;

    expect(Survey.needToShow()).toBe(false);
  });
});
