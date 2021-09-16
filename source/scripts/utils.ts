import { Alert } from "react-native";

export function dateFrom(date: Date | string): Date {
  if (typeof date === "string") {
    return new Date(date);
  }
  return date;
}

export class Result {
  success: boolean;
  message?: string;
  error?: Error;
  data?: any;

  constructor({ success, message, error, data }:
                {
                  success: boolean,
                  message?: string,
                  error?: Error,
                  data?: any,
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
