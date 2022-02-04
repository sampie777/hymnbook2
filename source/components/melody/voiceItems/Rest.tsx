import React from "react";
import { StyleSheet } from "react-native";
import { VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import { Circle, G, Path, Rect } from "react-native-svg";
import { AbcConfig } from "./config";

interface Props {
  note: VoiceItemNote;
}

const Rest: React.FC<Props> = ({ note }) => {
  if (note.rest === undefined) {
    return null;
  }

  // Convert strange rests to normal rests
  if (note.rest.type === "multimeasure" && note.rest.text !== undefined) {
    note.duration = note.rest.text / 8;
  }

  const width = 10;

  if (note.duration >= 0.5) {
    const yOffset = note.duration === 1 ? 0 : 0.5 * AbcConfig.lineSpacing;

    return <G x={width / -2}
              y={AbcConfig.lineSpacing}>
      <Rect x={0} y={yOffset}
            width={width} height={4}
            fill={"#000"} />

      {!(note.duration === 0.625 || note.duration === 0.75 || note.duration === 0.875) ? undefined :
        <Circle cx={width + 5.5}
                cy={yOffset}
                r={2}
                fill={"#000"} />
      }
    </G>;
  }

  if (note.duration < 0.25) {
    const yOffset = 0.5 * AbcConfig.lineSpacing;

    return <G x={width / -2}
              y={AbcConfig.lineSpacing}>
      <Circle cx={0}
              cy={yOffset - 0.2}
              r={2.8}
              fill={"#000"} />

      <Path d={"M-2 5 S4 9 6.8 2 L2 17"}
            stroke={"#000"}
            strokeWidth={1.5}
      />
    </G>;
  }

  const yOffset = AbcConfig.lineSpacing;
  return <G x={width / -2}
            y={0.5 * AbcConfig.lineSpacing}>
    <Path d={"M0 0 " +
    "C5 12 -8 4 1 16 " +
    "S-4.7 8 -2 23" +
    "Q-2 20 3 18" +
    "C-7 7 10 16 0 0" +
    "z"}
          fill={"#000"}
          stroke={"#000"}
          strokeWidth={1.5}
    />

    {!(note.duration === 0.375) ? undefined :
      <Circle cx={width}
              cy={yOffset}
              r={2}
              fill={"#000"} />}
  </G>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default Rest;
