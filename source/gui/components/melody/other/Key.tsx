import React from "react";
import { KeySignature } from "../../../../logic/songs/abc/abcjsTypes";
import { SharedValue } from "react-native-reanimated";
import NoteElement from "../voiceItems/NoteElement/NoteElement.tsx";

interface Props {
  melodyScale: SharedValue<number>;
  keySignature: KeySignature;
}

const Key: React.FC<Props> = ({ melodyScale, keySignature }) => {
  if (keySignature.accidentals === undefined || keySignature.accidentals.length === 0) {
    return null;
  }

  const keyToCharMap = [
    "G", "D", "A", "E", "B", "F#", "C#",
    "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"
  ]
  const baseKeyChar = "¡".charCodeAt(0);

  const text = (keySignature.root == "C") ? "="
    : String.fromCharCode(baseKeyChar + keyToCharMap.indexOf(keySignature.root));

  return <NoteElement melodyScale={melodyScale} customNote={text} />;
};

export default Key;
