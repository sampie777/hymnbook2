import React from "react";
import { StyleSheet, View } from "react-native";
import { AbcPitch, StemDirection, VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import Svg, { Ellipse, G, Line, Rect, Text } from "react-native-svg";
import Lines from "./Lines";

interface NoteProps {
  pitch: AbcPitch,
  note: VoiceItemNote,
  verticalSpacing: number
}

const Note: React.FC<NoteProps> = ({ pitch, note, verticalSpacing }) => {
  const y = (10 - pitch.pitch) * (verticalSpacing / 2);
  const lineWidth = 2;
  const lineHeight = verticalSpacing * 3;
  const width = verticalSpacing / 10 * 6;
  const height = verticalSpacing / 10 * 3.5;

  const fill = note.duration <= 0.25;
  let stem: StemDirection = "none";
  if (note.duration < 1) {
    if (pitch.pitch < 6) {
      stem = "up";
    } else {
      stem = "down";
    }
  }

  return <G y={y}>
    {stem !== "up" ? undefined :
      <Line x1={width - lineWidth + 2} y1={-2.5}
            x2={width - lineWidth + 1.5} y2={-1 * lineHeight}
            stroke="#000"
            strokeWidth={lineWidth} />}
    {stem !== "down" ? undefined :
      <Line x1={-1 * width - lineWidth + 2} y1={2.5}
            x2={-1 * width - lineWidth + 1.5} y2={lineHeight}
            stroke="#000"
            strokeWidth={lineWidth} />}

    <Ellipse rotation={note.duration === 1 ? 0 : -30}
             rx={width} ry={note.duration === 1 ? 1.3 * height : height}
             strokeWidth={2.5}
             stroke={"#000"}
             fill={fill ? "#000" : "none"} />
  </G>;
};

interface Props {
  item: VoiceItemNote;
}

const VoiceItemNoteElement: React.FC<Props> = ({ item }) => {
  const lyrics = item.lyric.map(it => it.syllable).join(" ");

  const textWidth = lyrics.length * 10;
  const verticalSpacing = 8;
  const padding = verticalSpacing / 10 * 10;
  const width = 2 * padding + verticalSpacing / 10 * textWidth;
  const height = 12 * verticalSpacing;

  return <View style={styles.container}>
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <G scale={1} y={2}>
        <Lines verticalSpacing={verticalSpacing} />

        <G x={width / 2}>
          {item.pitches.map((it, index) =>
            <Note key={index + "_" + it.pitch}
                  pitch={it}
                  note={item}
                  verticalSpacing={verticalSpacing} />
          )}
        </G>

        <Text fontSize={verticalSpacing / 10 * 24}
              x={width / 2}
              y={10 * verticalSpacing}
              fill={"#000"}
              textAnchor={"middle"}>
          {lyrics}
        </Text>
      </G>
    </Svg>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
  }
});

export default VoiceItemNoteElement;
