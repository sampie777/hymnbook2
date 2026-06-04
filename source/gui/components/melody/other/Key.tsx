import React from "react";
import { KeySignature } from "@hymnbook/abc";
import { SharedValue } from "react-native-reanimated";
import NoteElement from "../voiceItems/NoteElement/NoteElement.tsx";

interface Props {
  melodyScale: SharedValue<number>;
  keySignature: KeySignature;
  showChords: boolean;
}

const Key: React.FC<Props> = ({ melodyScale, keySignature, showChords }) => {
  if (keySignature.accidentals === undefined || keySignature.accidentals.length === 0) {
    return null;
  }

  const keyToCharMap = [
    "G", "D", "A", "E", "B", "F#", "C#",
    "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"
  ]
  const baseKeyChar = "¡".charCodeAt(0);

  console.log(keySignature)
  const text = (keySignature.root == "C") ? "="
    : String.fromCharCode(baseKeyChar + keyToCharMap.indexOf(keySignature.root + keySignature.acc));

  return <NoteElement melodyScale={melodyScale}
                      customNote={text}
                      showChords={showChords} />;
};

export default Key;
