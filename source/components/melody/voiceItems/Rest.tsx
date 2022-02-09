import React from "react";
import { AbcConfig } from "./config";
import { VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import { StyleSheet } from "react-native";
import { Circle, G, Path, Rect } from "react-native-svg";

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
            y={0.5 * AbcConfig.lineSpacing}
  >
    <G y={-31}
       x={-28}
       scale={0.08}>
      <Path
        d={"m414.37 453.28c0 18.812-37.624 47.03-37.624 84.655 0 14.109 28.218 56.436 47.03 79.952-9.4061-4.703-18.812-9.4061-32.921-9.4061-28.218 0-37.624 23.515-37.624 37.624 0 9.4061 9.4061 18.812 14.109 28.218-28.218-18.812-47.03-37.624-47.03-56.436 0-47.03 32.122-30.57 55.637-39.976-23.515-23.515-46.231-58.788-46.231-72.897 0-9.4061 28.218-42.327 37.624-65.842v-14.109c0-14.109-9.4061-32.921-14.109-47.03 18.812 23.515 61.139 65.843 61.139 75.249z"}
        fill={"#000"}
        stroke={"#000"}
        strokeWidth={1.5}
      />
    </G>

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
