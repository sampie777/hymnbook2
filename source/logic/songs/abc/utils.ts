// See: https://www.fontspace.com/musiqwik-font-f3722#action=charmap&id=rvL8
import { VoiceItemNote } from "@hymnbook/abc";

const C1_8 = "B".charCodeAt(0);
const C1_4 = "R".charCodeAt(0);
const C1_3 = "²".charCodeAt(0);
const C1_2 = "b".charCodeAt(0);
const C1_1 = "r".charCodeAt(0);

const Csharp = "Ò".charCodeAt(0);
const Cflat = "â".charCodeAt(0);
const Cnatural = "ò".charCodeAt(0);

export const getNoteAccidental = (pitch: number, accidental: string | undefined) => {
  let baseC;
  if (accidental === "sharp") baseC = Csharp;
  else if (accidental === "flat") baseC = Cflat;
  else if (accidental === "natural") baseC = Cnatural;
  else return "";

  return String.fromCharCode(baseC + pitch)
}

export const getNoteChar = (pitch: number, duration: number) => {
  if (pitch == -3) {
    if (duration < 1 / 4) return "ƒ";
    if (duration < 1 / 2) return "ˆ";
    if (duration < 1 / 1) return "’";
    return "—";
  }
  if (pitch == -4) {
    if (duration < 1 / 4) return "‚";
    if (duration < 1 / 2) return "‡";
    if (duration < 1 / 1) return "‘";
    return "–";
  }

  if (pitch > 12) pitch -= 7;
  if (pitch < -2) pitch += 7;

  let baseC = C1_1;
  if (duration < 1 / 4) baseC = C1_8;
  else if (duration < 1 / 2) baseC = C1_4;
  else if (duration < 1 / 1) baseC = C1_2;

  return String.fromCharCode(baseC + pitch);
}

export const getNoteDot = (pitch: number, duration: number) => {
  if (!(duration === 3 / 32 || duration === 3 / 16 || duration === 3 / 8 || duration === 5 / 8 || duration === 7 / 8 || duration === 3 / 4 || duration > 1))
    return ""
  if (pitch == -3 || pitch == -4) return "œ"
  return String.fromCharCode(C1_3 + pitch)
}

export const getNoteRest = (note: VoiceItemNote) => {
  if (note.rest === undefined) {
    return null;
  }

  if (note.rest.type === "spacer") {
    return null;
  }

  // Convert strange rests to normal rests
  if (note.rest.type === "multimeasure" && note.rest.text !== undefined) {
    note.duration = note.rest.text / 8;
  }

  if (note.duration >= 1 / 2) {
    return (note.duration == 1 ? "<" : "")
      + (note.duration >= 1 / 2 && note.duration < 1 ? ";" : "")
      + (note.duration === 5 / 8 || note.duration === 3 / 4 || note.duration === 7 / 8 ? "¸" : "")
  }

  if (note.duration < 1 / 4) {
    return ("9")
      + (note.duration === (3 / 16) ? "¸" : "")
  }


  return (":")
    + (note.duration === 3 / 8 ? "¸" : "")
}

export const getNoteLyrics = (note: VoiceItemNote) => {
  return note.lyric
    ?.map(it => it.divider !== "-" ? it.syllable : it.syllable + "" + it.divider)
    .join(" ") || ""
}

export enum MelodyTextAlignment {
  Left = "Left",
  Center = "Center",
}