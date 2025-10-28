import React from "react";
import { AbcClef } from "../../../../logic/songs/abc/abcjsTypes";
import { SharedValue } from "react-native-reanimated";
import NoteElement from "../voiceItems/NoteElement/NoteElement.tsx";

interface Props {
  melodyScale: SharedValue<number>;
  clef: AbcClef;
}

const Clef: React.FC<Props> = ({ melodyScale, clef }) => {
  return <NoteElement melodyScale={melodyScale}
                      customNote={clef.type !== "bass" ? " &" : " 0"} />;
};

export default Clef;
