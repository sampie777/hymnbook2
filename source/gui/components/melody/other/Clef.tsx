import React from "react";
import { AbcClef } from "@hymnbook/abc";
import { SharedValue } from "react-native-reanimated";
import NoteElement from "../voiceItems/NoteElement/NoteElement.tsx";

interface Props {
  melodyScale: SharedValue<number>;
  clef: AbcClef;
  showChords: boolean;
}

const Clef: React.FC<Props> = ({ melodyScale, clef, showChords }) => {
  return <NoteElement melodyScale={melodyScale}
                      customNote={clef.type !== "bass" ? " &" : " 0"}
                      showChords={showChords}/>;
};

export default Clef;
