import { locale } from "./locale.ts";

declare global {
  interface Date {
    resetDateToMidnight(): Date;
    format(format: string): string;
  }
}

Date.prototype.resetDateToMidnight = function() {
  this.setHours(0, 0, 0, 0);
  return this;
}

Date.prototype.format = function(format: string) {
  return format
    .replace(/%dddd/g, locale.en.constants.date.days[this.getDay()])
    .replace(/%dd/g, locale.en.constants.date.days_short[this.getDay()])
    .replace(/%dd/g, this.getDate().toString().padStart(2, '0'))
    .replace(/%d/g, this.getDate().toString())
    .replace(/%mmmm/g, locale.en.constants.date.months[this.getMonth()])
    .replace(/%mmm/g, locale.en.constants.date.months_short[this.getMonth()])
    .replace(/%mm/g, (this.getMonth() + 1).toString().padStart(2, '0'))
    .replace(/%m/g, (this.getMonth() + 1).toString())
    .replace(/%YYYY/g, this.getFullYear().toString())
    .replace(/%YY/g, (this.getFullYear() % 100).toString())
    .replace(/%Y/g, this.getFullYear().toString())
    .replace(/%HH/g, this.getHours().toString().padStart(2, '0'))
    .replace(/%H/g, this.getHours().toString())
    .replace(/%MM/g, this.getMinutes().toString().padStart(2, '0'))
    .replace(/%M/g, this.getMinutes().toString())
    .replace(/%SS/g, this.getSeconds().toString().padStart(2, '0'))
    .replace(/%S/g, this.getSeconds().toString())
    .replace(/%f/g, this.getMilliseconds().toString().padStart(3, '0'));
}
