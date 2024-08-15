import { Alert, AppState, Linking, Platform, ScaledSize, Share } from "react-native";
import KeepAwake from "react-native-keep-awake";
import Clipboard from "@react-native-clipboard/clipboard";
import { rollbar } from "./rollbar";
import config from "../config";
import { stringMd5 } from "react-native-quick-md5";
import { locale } from "./locale";

export function dateFrom(date: Date | string): Date {
  if (typeof date === "string") {
    return new Date(date);
  }
  return date;
}

export class Result<T = any> {
  success: boolean;
  message?: string;
  error?: Error;
  data?: T;

  constructor({ success, message, error, data }:
                {
                  success: boolean,
                  message?: string,
                  error?: Error,
                  data?: T,
                }) {
    this.success = success;
    this.message = message;
    this.error = error;
    this.data = data;
  }

  alert() {
    const message = this.message || this.error?.toString();
    if (message === undefined) {
      return;
    }
    Alert.alert((this.success ? "Success" : "Error"), message);
  }

  throwIfException() {
    if (this.error !== undefined) {
      throw this.error;
    }
  }
}

export const alertAndThrow = (error: Error | unknown, title = "Error") => {
  Alert.alert(title, error?.toString());
  throw error;
}

export function capitalize(word: string) {
  if (word.length === 0) {
    return word;
  }

  if (word.length === 1) {
    return word.toUpperCase();
  }

  return word.charAt(0).toUpperCase() + word.substring(1);
}

export function keepScreenAwake(value: boolean) {
  if (value) {
    KeepAwake.activate();
  } else {
    KeepAwake.deactivate();
  }
}

export function isPortraitMode(window: ScaledSize) {
  return window.height >= window.width;
}

export function openLink(url?: string): Promise<any> {
  if (!url) {
    rollbar.critical("Trying to open link with empty url: '" + url + "'.");
    return new Promise(_ => {
      throw new Error("This URL doesn't exists. Please contact the developer.");
    });
  }

  return Linking.openURL(url)
    .catch(error => {
      if (error == undefined || error.message == undefined || !(
        `${error.message}`.startsWith("Your device can't open these type of URLs.")
        || `${error.message}`.includes("No Activity found to handle Intent")
      )) {
        rollbar.warning("Failed to open URL", { ...sanitizeErrorForRollbar(error), url: url });
      }

      Clipboard.setString(url);
      throw new Error("Your device can't open these type of URLs. The URL is copied to your clipboard so you can open it on your own.");
    });
}

export const isAndroid = Platform.OS === "android";

export const isIOS = Platform.OS === "ios";

export class ValidationError extends Error {
}

export function validate(result: boolean, message?: string) {
  if (result) {
    return;
  }
  throw new ValidationError(message || "Value is not true");
}

export const objectToArrayIfNotAlready = (obj: any) => {
  if (obj === undefined) {
    return [];
  }
  if (obj instanceof Array) {
    return obj;
  }
  return [obj];
};

const languageAbbreviationMap = {
  "AF": "Afrikaans",
  "NL": "Nederlands",
  "EN": "English",
  "DE": "Deutsch",
  "FA": "Français"
};
export const languageAbbreviationToFullName = (abbreviation: string) => {
  // @ts-ignore
  return languageAbbreviationMap[abbreviation.toUpperCase()] || abbreviation;
};

export const runAsync = (f: () => any) => setTimeout(f, 0);

export const emptyPromise = (): Promise<null> => Promise.resolve(null);
export const emptyPromiseWithValue = <T>(value: T): Promise<T> => Promise.resolve(value);

export const shareApp = () => {
  return Share.share({
    message: `Hey, you should try this new app!
${config.homepage}`
  })
    .then(r => rollbar.debug("App shared.", r))
    .catch(error => rollbar.warning("Failed to share app", sanitizeErrorForRollbar(error)));
};

export const sanitizeErrorForRollbar = <T>(error: T): {
  error: {
    original: T,
    json: string,
    name?: string | null,
    type?: string | null,
    message?: string | null,
    stack?: string | null
  }
} => {
  if (!(error instanceof Error)) {
    return {
      error: {
        original: error,
        json: JSON.stringify(error)
      }
    };
  }

  return {
    error: {
      original: error,
      name: error.name,
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      json: JSON.stringify(error)
    }
  };
};

export const executeInForeGround = <T>(callback: () => Promise<T>): Promise<T> => new Promise(resolve => {
  if (AppState.currentState == "active") {
    return resolve(callback());
  }

  const listener = AppState.addEventListener("change", newState => {
    if (newState == "active") {
      listener.remove();
      resolve(callback());
    }
  });
});

export const delayed = <T>(callback: () => T, delay: number) => new Promise<T>(resolve =>
  setTimeout(async () =>
      resolve(await callback()),
    delay));

// According to: https://askubuntu.com/a/222650
export const readableFileSizeSI = (size: number): string => {
  if (size < 1000) return `${size} bytes`;
  if (size < 1000 * 1000) return `${(size / 1000).toFixed(0)} kB`;
  if (size < 1000 * 1000 * 1000) return `${(size / (1000 * 1000)).toFixed(1)} MB`;
  return `${(size / (1000 * 1000 * 1000)).toFixed(1)} GB`;
}

// According to: https://askubuntu.com/a/222650
export const readableFileSizeIEC = (size: number): string => {
  if (size < 1024) return `${size} bytes`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KiB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MiB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GiB`;
}

export const hash = (value: string): string => stringMd5(value);

export const isTestEnv = () => process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test';

export const format = (date: Date | string, format: string) => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return format
    .replace(/%dd/g, date.getDate().toString().padStart(2, '0'))
    .replace(/%d/g, date.getDate().toString())
    .replace(/%mmmm/g, locale.en.constants.date.months[date.getMonth()])
    .replace(/%mmm/g, locale.en.constants.date.months_short[date.getMonth()])
    .replace(/%mm/g, (date.getMonth() + 1).toString().padStart(2, '0'))
    .replace(/%m/g, (date.getMonth() + 1).toString())
    .replace(/%YYYY/g, date.getFullYear().toString())
    .replace(/%YY/g, (date.getFullYear() % 100).toString())
    .replace(/%Y/g, date.getFullYear().toString())
    .replace(/%HH/g, date.getHours().toString().padStart(2, '0'))
    .replace(/%H/g, date.getHours().toString())
    .replace(/%MM/g, date.getMinutes().toString().padStart(2, '0'))
    .replace(/%M/g, date.getMinutes().toString())
    .replace(/%SS/g, date.getSeconds().toString().padStart(2, '0'))
    .replace(/%S/g, date.getSeconds().toString())
    .replace(/%f/g, date.getMilliseconds().toString().padStart(3, '0'));
}

export const consoleDir = (data: any) => console.debug(JSON.stringify(data, null, 2))