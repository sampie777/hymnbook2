import Settings from "../../source/scripts/settings";
import { Survey } from "../../source/scripts/survey";

describe("test survey", () => {
  it("needs to show when multiple of 4 but greater than 4", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 8;

    expect(Survey.needToShow()).toBe(true);
  });
  it("needs to show when multiple of 4 but greater than 4 (2)", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 12;

    expect(Survey.needToShow()).toBe(true);
  });
  it("needs not to show when less than 5", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 0;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when less than 5 (2)", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 1;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when less than 5", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 4;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when not multiple of 4", () => {
    Settings.surveyCompleted = false;
    Settings.appOpenedTimes = 5;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when already completed", () => {
    Settings.surveyCompleted = true;
    Settings.appOpenedTimes = 8;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when already completed or less than 5", () => {
    Settings.surveyCompleted = true;
    Settings.appOpenedTimes = 4;

    expect(Survey.needToShow()).toBe(false);
  });
  it("needs not to show when already completed or less than 5", () => {
    Settings.surveyCompleted = true;
    Settings.appOpenedTimes = 0;

    expect(Survey.needToShow()).toBe(false);
  });
});
