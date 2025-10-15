import React, { memo } from "react";
import { AbcPitch } from "../../../../../logic/songs/abc/abcjsTypes";

interface Props {
  pitch: AbcPitch,
  duration: number,
}

const Note: React.FC<Props> = ({ pitch, duration }) => {
  if (pitch.pitch > 12) pitch.pitch -= 9;
  if (pitch.pitch < -2) pitch.pitch += 9;

  // See: https://www.fontspace.com/musiqwik-font-f3722#action=charmap&id=rvL8
  const C1_8 = "B".charCodeAt(0);
  const C1_4 = "R".charCodeAt(0);
  const C1_3 = "²".charCodeAt(0);
  const C1_2 = "b".charCodeAt(0);
  const C1_1 = "r".charCodeAt(0);

  let baseC = C1_1;
  if (duration < 1 / 4) baseC = C1_8;
  else if (duration < 1 / 2) baseC = C1_4;
  else if (duration < 1 / 1) baseC = C1_2;

  return <>
      {String.fromCharCode(baseC + pitch.pitch)}
      {duration === 3 / 8 || duration === 5 / 8 || duration === 7 / 8 || duration === 3 / 4 || duration > 1 ? String.fromCharCode(C1_3 + pitch.pitch) : ""}
      {duration === 5 / 8 || duration === 7 / 8 ? String.fromCharCode(C1_3 + pitch.pitch) : ""}
      {duration === 7 / 8 ? String.fromCharCode(C1_3 + pitch.pitch) : ""}
    </>
};

const propsAreEqual = (prevProps: Props, nextProps: Props): boolean =>
  prevProps.pitch.pitch === nextProps.pitch.pitch &&
  prevProps.pitch.accidental === nextProps.pitch.accidental &&
  prevProps.duration === nextProps.duration;

export default memo(Note, propsAreEqual);
