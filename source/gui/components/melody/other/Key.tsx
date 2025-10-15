import React from "react";
import { useAbcMusicStyle } from "../config";
import { KeySignature } from "../../../../logic/songs/abc/abcjsTypes";
import Animated, { SharedValue } from "react-native-reanimated";

interface Props {
  melodyScale: SharedValue<number>;
  keySignature: KeySignature;
}

const Key: React.FC<Props> = ({ melodyScale, keySignature }) => {
  const animatedStyle = useAbcMusicStyle(melodyScale);

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

  return <Animated.Text style={animatedStyle}>
    {text}
  </Animated.Text>
};

export default Key;
