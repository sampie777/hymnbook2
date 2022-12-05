import { Alert, Linking, Platform, ScaledSize } from "react-native";
import KeepAwake from "react-native-keep-awake";
import Clipboard from "@react-native-clipboard/clipboard";
import { rollbar } from "./rollbar";

export function dateFrom(date: Date | string): Date {
  if (typeof date === "string") {
    return new Date(date);
  }
  return date;
}

export class Result<T = any > {
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

  return Linking.canOpenURL(url)
    .then(isSupported => {
      if (isSupported) {
        return Linking.openURL(url);
      } else {
        Clipboard.setString(url);
        throw new Error("Your device can't open these type of URLs. The URL is copied to your clipboard so you can open it on your own.");
      }
    })
    .catch(error => {
      if (error !== undefined && error.message !== undefined && `${error.message}`.startsWith("Your device can't open these type of URLs.")) {
        rollbar.info(error);
      } else {
        rollbar.warning(error);
      }
      throw error;
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
