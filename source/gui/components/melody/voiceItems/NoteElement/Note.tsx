import React from "react";
import { AbcPitch } from "@hymnbook/abc";
import { getNoteAccidental, getNoteChar, getNoteDot } from "../../../../../logic/songs/abc/utils.ts";

interface Props {
  pitch: AbcPitch,
  duration: number,
}

const Note: React.FC<Props> = ({ pitch, duration }) => {

  const noteAccidental = getNoteAccidental(pitch.pitch, pitch.accidental);
  const noteChar = getNoteChar(pitch.pitch, duration);
  const noteDot = getNoteDot(pitch.pitch, duration);

  return <>
    {noteAccidental}
    {noteChar}
    {noteDot}
  </>
};

export default Note
