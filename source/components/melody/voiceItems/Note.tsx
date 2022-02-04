import React from "react";
import { StyleSheet } from "react-native";
import { AbcPitch, StemDirection, VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import { AbcConfig } from "./config";
import { Circle, Ellipse, G, Line, Path, Text } from "react-native-svg";

interface Props {
  pitch: AbcPitch,
  note: VoiceItemNote,
}

const Note: React.FC<Props> = ({ pitch, note }) => {
  const y = (10 - pitch.pitch) * (AbcConfig.lineSpacing / 2);
  const width = AbcConfig.noteWidth;

  const fill = note.duration < 0.5;
  let stem: StemDirection = "none";
  if (note.duration < 1) {
    if (pitch.pitch < 6) {
      stem = "up";
    } else {
      stem = "down";
    }
  }

  const extraLines = [];
  for (let i = 0; i >= pitch.pitch; i--) {
    if ((pitch.pitch - i) % 2 === 0) {
      extraLines.push(i / 2);
    }
  }
  for (let i = 0; i <= pitch.pitch - 12; i++) {
    if ((pitch.pitch - i) % 2 === 0) {
      extraLines.push(i / 2);
    }
  }

  const stemX = stem === "up"
    ? AbcConfig.stemWidth + width * 0.6
    : AbcConfig.stemWidth - width * 1.4;

  return <G y={y}>
    {stem !== "up" ? undefined :
      <Line x1={stemX} y1={-1.5}
            x2={stemX} y2={-1 * AbcConfig.stemHeight}
            stroke="#000"
            strokeWidth={AbcConfig.stemWidth} />}
    {stem !== "down" ? undefined :
      <Line x1={stemX} y1={2.5}
            x2={stemX} y2={AbcConfig.stemHeight}
            stroke="#000"
            strokeWidth={AbcConfig.stemWidth} />}

    {note.duration !== 0.125 ? undefined :
      <G x={stemX} y={(stem === "up" ? -1 : 1) * AbcConfig.stemHeight}
         transform={stem === "up" ? undefined : "scale(1, -1)"}>
        <Path
          d={"M0 0 C 1 8 8 13 6 20 S 8 12 0 10 z"}
          fill={"#000"}
          fillRule={"evenodd"}
          stroke={"#000"}
          strokeWidth={0.7} />
      </G>}

    {extraLines.map(it =>
      <Line key={it}
            x1={-1 * width - 5} y1={it * AbcConfig.lineSpacing}
            x2={width + 5} y2={it * AbcConfig.lineSpacing}
            stroke="#000"
            strokeWidth={AbcConfig.lineWidth} />)}

    <Ellipse rotation={note.duration === 1 ? 0 : -30}
             rx={width}
             ry={note.duration === 1 ? 1.3 * AbcConfig.noteHeight : AbcConfig.noteHeight}
             strokeWidth={2.5}
             stroke={"#000"}
             fill={fill  ? "#000" : "none"} />

    {note.duration !== 1 ? undefined :
      <Ellipse rotation={note.duration === 1 ? 0 : -30}
               rx={width + 2.3}
               ry={note.duration === 1 ? 1.3 * AbcConfig.noteHeight : AbcConfig.noteHeight}
               strokeWidth={2.0}
               stroke={"#000"}
               fill={"none"} />}


    {!(note.duration === 0.375 || note.duration === 0.625) ? undefined :
      <Circle cx={width + 6.5}
              cy={pitch.pitch % 2 === 0 ? -1 * (AbcConfig.lineSpacing / 2) : 0}
              r={2}
              fill={"#000"} />
    }

    {pitch.accidental !== "sharp" ? undefined :
      <Text fontSize={22}
            x={-7} y={6}
            fill={"#000"}
            textAnchor={"end"}>♯</Text>}

    {pitch.accidental !== "flat" ? undefined :
      <Text fontSize={34}
            x={-7} y={4}
            fill={"#000"}
            textAnchor={"end"}>♭</Text>}

    {pitch.accidental !== "natural" ? undefined :
      <Text fontSize={28}
            x={-7} y={4}
            fill={"#000"}
            textAnchor={"end"}>♮</Text>}
  </G>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default Note;
