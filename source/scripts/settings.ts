import { Setting } from "../models/Settings";
import Db from "./db/db";
import { AccessRequestStatus } from "./server/models";
import { SettingSchema } from "../models/SettingsSchema";
import { rollbar } from "./rollbar";

class SettingsProvider {
  static set(key: string, value: string) {
    if (!Db.settings.isConnected()) {
      return;
    }

    Db.settings.realm().write(() => {
      // @ts-ignore
      Db.settings.realm().create(SettingSchema.name,
        new Setting({ key, value }),
        "all");
    });
  }

  static setNumber(key: string, value: number) {
    const stringValue = value.toString();
    return this.set(key, stringValue);
  }

  static setBoolean(key: string, value: boolean) {
    const stringValue = value.toString();
    return this.set(key, stringValue);
  }

  static get(key: string): string | undefined {
    if (!Db.settings.isConnected()) {
      // @ts-ignore
      return Settings[key];
    }

    const value = Db.settings.realm().objects(SettingSchema.name).filtered(`key = "${key}"`);
    if (value === null || value === undefined || value[0] === undefined) {
      // @ts-ignore
      return Settings[key];
    }
    return (value[0] as unknown as Setting).value;
  }

  static getNumber(key: string): number | undefined {
    const stringValue = this.get(key);
    if (stringValue === undefined) {
      // @ts-ignore
      return Settings[key];
    }

    return +stringValue;
  }

  static getBoolean(key: string): boolean | undefined {
    const stringValue = this.get(key);
    if (stringValue === undefined) {
      // @ts-ignore
      return Settings[key];
    }

    return stringValue.toString() == "true";
  }
}

class SettingsClass {
  // System
  keepScreenAwake = true;
  appOpenedTimes = 0;

  // Search
  maxSearchInputLength = 3;
  maxSearchResultsLength = 40;

  // Songs
  songScale = 1.0;
  scrollToTopAnimated = true;
  songFadeIn = true;

  // Backend
  songBundlesApiUrl = "http://jschedule.sajansen.nl";

  // Server authentication
  useAuthentication = true;
  authClientName = "";
  authRequestId = "";
  authJwt = "";
  authStatus = AccessRequestStatus.UNKNOWN;
  authDeniedReason = "";

  // Survey
  surveyCompleted = false;

  load() {
    console.log("Loading settings");

    Object.entries(this).forEach(([key, value]) => {
      const dbValue = this.loadValueFor(key, value);
      if (dbValue !== undefined) {
        // @ts-ignore
        this[key] = dbValue;
      }
    });
  }

  private loadValueFor(key: string, value: any) {
    switch (typeof value) {
      case "string":
        return SettingsProvider.get(key);
      case "number":
        return SettingsProvider.getNumber(key);
      case "boolean":
        return SettingsProvider.getBoolean(key);
      default:
        rollbar.error("No matching get function found for loading type of key: " + key + " of type: " + typeof value);
    }
  }

  store() {
    console.log("Storing settings");
    Object.entries(this).forEach(([key, value]) => {
      switch (typeof value) {
        case "string":
          return SettingsProvider.set(key, value);
        case "number":
          return SettingsProvider.setNumber(key, value);
        case "boolean":
          return SettingsProvider.setBoolean(key, value);
        default:
          rollbar.error("No matching set function found for storing type of key: " + key + " of type: " + typeof value);
      }
    });
  }

  get(key: string): any {
    // @ts-ignore
    return this[key];
  }
}

const Settings = new SettingsClass();
export default Settings;
