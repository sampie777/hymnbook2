import Settings from "../../source/settings";
import { Survey } from "../../source/logic/survey";
import config from "../../source/config";

describe("test survey", () => {
  const nonSundayDate = new Date(1662373004108);

  it("needs to show when multiple of displayInterval and greater or equal to minimumOpenedTimes", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + config.surveyDisplayInterval;

    expect(Survey.needToShow(nonSundayDate)).toBe(true);
  });
  it("needs to show when multiple of 4 but greater than 4 (2)", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + 3 * config.surveyDisplayInterval;

    expect(Survey.needToShow(nonSundayDate)).toBe(true);
  });
  it("needs not to show when less than minimumOpenedTimes", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 0;

    expect(Survey.needToShow(nonSundayDate)).toBe(false);
  });
  it("needs not to show when less than minimumOpenedTimes (2)", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 1;

    expect(Survey.needToShow(nonSundayDate)).toBe(false);
  });
  it("needs not to show when less than minimumOpenedTimes", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes - 1;

    expect(Survey.needToShow(nonSundayDate)).toBe(false);
  });
  it("needs not to show when not multiple of displayInterval", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + 1.5 * config.surveyDisplayInterval;

    expect(Survey.needToShow(nonSundayDate)).toBe(false);
  });
  it("needs not to show when already completed", () => {
    Settings.surveyCompleted = true;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + config.surveyDisplayInterval;

    expect(Survey.needToShow(nonSundayDate)).toBe(false);
  });
  it("needs not to show when already completed or less than minimumOpenedTimes", () => {
    Settings.surveyCompleted = true;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes - 1;

    expect(Survey.needToShow(nonSundayDate)).toBe(false);
  });
  it("needs not to show when already completed or less than minimumOpenedTimes", () => {
    Settings.surveyCompleted = true;
    Settings.appOpenedTimes = 0;

    expect(Survey.needToShow(nonSundayDate)).toBe(false);
  });
  it("needs not to show when during sunday service hours", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + config.surveyDisplayInterval;

    let date = new Date(1662269400758); // Sunday 7:30

    expect(Survey.needToShow(date)).toBe(true);  // Sunday 7:30
    expect(Survey.needToShow(new Date(date.setHours(8)))).toBe(false);  // Sunday 8:30
    expect(Survey.needToShow(new Date(date.setHours(9)))).toBe(false);  // Sunday 9:30
    expect(Survey.needToShow(new Date(date.setHours(10)))).toBe(false);  // Sunday 10:30
    expect(Survey.needToShow(new Date(date.setHours(11)))).toBe(false);  // Sunday 11:30
    expect(Survey.needToShow(new Date(date.setHours(12)))).toBe(true);  // Sunday 12:30
    expect(Survey.needToShow(new Date(date.setHours(15)))).toBe(true);  // Sunday 15:30
    expect(Survey.needToShow(new Date(date.setHours(17)))).toBe(false);  // Sunday 17:30
    expect(Survey.needToShow(new Date(date.setHours(18)))).toBe(false);  // Sunday 18:30
    expect(Survey.needToShow(new Date(date.setHours(19)))).toBe(false);  // Sunday 19:30
    expect(Survey.needToShow(new Date(date.setHours(20)))).toBe(true);  // Sunday 20:30
  });
  it("needs to show when during weekdays", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = config.surveyMinimumAppOpenedTimes + config.surveyDisplayInterval;

    let date = new Date(1662355800758); // Monday 7:30

    expect(Survey.needToShow(date)).toBe(true);  // Monday 7:30
    expect(Survey.needToShow(new Date(date.setHours(8)))).toBe(true);  // Monday 8:30
    expect(Survey.needToShow(new Date(date.setHours(9)))).toBe(true);  // Monday 9:30
    expect(Survey.needToShow(new Date(date.setHours(10)))).toBe(true);  // Monday 10:30
    expect(Survey.needToShow(new Date(date.setHours(11)))).toBe(true);  // Monday 11:30
    expect(Survey.needToShow(new Date(date.setHours(12)))).toBe(true);  // Monday 12:30
    expect(Survey.needToShow(new Date(date.setHours(17)))).toBe(true);  // Monday 17:30
    expect(Survey.needToShow(new Date(date.setHours(18)))).toBe(true);  // Monday 18:30
    expect(Survey.needToShow(new Date(date.setHours(19)))).toBe(true);  // Monday 19:30
    expect(Survey.needToShow(new Date(date.setHours(20)))).toBe(true);  // Monday 20:30
  });
});
