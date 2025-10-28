import React from "react";
import { AbcPitch } from "../../../../../logic/songs/abc/abcjsTypes";

interface Props {
  pitch: AbcPitch,
  duration: number,
}

const Note: React.FC<Props> = ({ pitch, duration }) => {
  // See: https://www.fontspace.com/musiqwik-font-f3722#action=charmap&id=rvL8
  const C1_8 = "B".charCodeAt(0);
  const C1_4 = "R".charCodeAt(0);
  const C1_3 = "²".charCodeAt(0);
  const C1_2 = "b".charCodeAt(0);
  const C1_1 = "r".charCodeAt(0);

  const Csharp = "Ò".charCodeAt(0);
  const Cflat = "â".charCodeAt(0);
  const Cnatural = "ò".charCodeAt(0);

  const getAccidental = (pitch: number, accidental: string | undefined) => {
    let baseC;
    if (accidental === "sharp") baseC = Csharp;
    else if (accidental === "flat") baseC = Cflat;
    else if (accidental === "natural") baseC = Cnatural;
    else return "";

    return String.fromCharCode(baseC + pitch)
  }

  const getNoteChar = (pitch: number) => {
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

  const getNoteDot = (pitch: number, duration: number) => {
    if (!(duration === 3 / 32 || duration === 3 / 16 || duration === 3 / 8 || duration === 5 / 8 || duration === 7 / 8 || duration === 3 / 4 || duration > 1))
      return ""
    if (pitch == -3 || pitch == -4) return "œ"
    return String.fromCharCode(C1_3 + pitch)
  }

  const noteAccidental = getAccidental(pitch.pitch, pitch.accidental);
  const noteChar = getNoteChar(pitch.pitch);
  const noteDot = getNoteDot(pitch.pitch, duration);

  return <>
    {noteAccidental}
    {noteChar}
    {noteDot}
  </>
};

export default Note
