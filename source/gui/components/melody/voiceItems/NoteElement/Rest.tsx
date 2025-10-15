import React from "react";
import { VoiceItemNote } from "../../../../../logic/songs/abc/abcjsTypes";

interface Props {
  note: VoiceItemNote;
}

const Rest: React.FC<Props> = ({ note }) => {
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
    return <>
      {note.duration == 1 ? "<" : ""}
      {note.duration >= 1 / 2 && note.duration < 1 ? ";" : ""}
      {note.duration === 5 / 8 || note.duration === 3 / 4 || note.duration === 7 / 8 ? "¸" : ""}
    </>
  }

  if (note.duration < 1 / 4) {
    return <>
      {"9"}
      {note.duration === (3 / 16) ? "¸" : ""}
    </>
  }


  return <>
    {":"}
    {note.duration === 3 / 8 ? "¸" : ""}
  </>
};

export default Rest;
