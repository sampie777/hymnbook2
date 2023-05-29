import { Setting } from "../db/models/Settings";
import Db from "../db/db";
import { SettingSchema } from "../db/models/SettingsSchema";
import { rollbar } from "../rollbar";

class SettingsProvider {
  static set(key: string, value: string) {
    if (!Db.settings.isConnected()) {
      return;
    }

    return Db.settings.realm().write(() =>
      Db.settings.realm().create<Setting>(SettingSchema.name,
        new Setting({ key, value }),
        Realm.UpdateMode.All)
    );
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
      return undefined;
    }

    const value = Db.settings.realm()
      .objects<Setting>(SettingSchema.name)
      .filtered(`key = "${key}"`);

    if (value === null || value === undefined || value[0] === undefined) {
      return undefined;
    }
    return value[0].value;
  }

  static getNumber(key: string): number | undefined {
    const stringValue = this.get(key);
    if (stringValue === undefined) {
      return undefined;
    }

    const numberValue = +stringValue;
    if (isNaN(numberValue)) return undefined;
    return numberValue;
  }

  static getBoolean(key: string): boolean | undefined {
    const stringValue = this.get(key);
    if (stringValue === undefined) {
      return undefined;
    }

    return stringValue.toString() == "true";
  }
}

export class SettingsBaseClass {
  private _isLoaded = false;

  load() {
    Object.entries(this).forEach(([key, value]) => {
      const dbValue = this.loadValueFor(key, value);
      if (dbValue !== undefined) {
        // @ts-ignore
        this[key] = dbValue;
      }
    });
    this._isLoaded = true;
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
    if (!this._isLoaded) {
      // Settings can't be stored, as they are not loaded yet.
      // Return to prevent settings from being reset by default values.
      return;
    }

    try {
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
    } catch (error: any) {
      rollbar.error("Failed to store settings", {
        error: error,
        errorType: error.constructor.name,
        settings: this
      });
    }
  }

  get(key: string): any {
    // @ts-ignore
    return this[key];
  }
}
