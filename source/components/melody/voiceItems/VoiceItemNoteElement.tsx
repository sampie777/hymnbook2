import React from "react";
import { StyleSheet, View } from "react-native";
import { AbcPitch, StemDirection, VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import Svg, { Ellipse, G, Line, Text } from "react-native-svg";
import Lines from "./Lines";
import { AbcConfig } from "./config";

interface NoteProps {
  pitch: AbcPitch,
  note: VoiceItemNote,
}

const Note: React.FC<NoteProps> = ({ pitch, note }) => {
  const y = (10 - pitch.pitch) * (AbcConfig.lineSpacing / 2);
  const lineHeight = AbcConfig.stemHeight;
  const width = AbcConfig.noteWidth;
  const height = AbcConfig.noteHeight;

  const fill = note.duration <= 0.25;
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

  return <G y={y}>
    {stem !== "up" ? undefined :
      <Line x1={AbcConfig.stemWidth + width * 0.6} y1={-1.5}
            x2={AbcConfig.stemWidth + width * 0.6} y2={-1 * lineHeight}
            stroke="#000"
            strokeWidth={AbcConfig.stemWidth} />}
    {stem !== "down" ? undefined :
      <Line x1={AbcConfig.stemWidth - width * 1.4} y1={2.5}
            x2={AbcConfig.stemWidth - width * 1.4} y2={lineHeight}
            stroke="#000"
            strokeWidth={AbcConfig.stemWidth} />}

    {extraLines.map(it =>
      <Line x1={-1 * width - 5} y1={it * AbcConfig.lineSpacing}
            x2={width + 5} y2={it * AbcConfig.lineSpacing}
            stroke="#000"
            strokeWidth={AbcConfig.lineWidth} />)}

    <Ellipse rotation={note.duration === 1 ? 0 : -30}
             rx={width}
             ry={note.duration === 1 ? 1.3 * height : height}
             strokeWidth={2.5}
             stroke={"#000"}
             fill={fill ? "#000" : "none"} />
  </G>;
};

interface Props {
  item: VoiceItemNote;
  scale: number;
}

const VoiceItemNoteElement: React.FC<Props> = ({ item, scale }) => {
  const lyrics = item.lyric?.map(it => it.syllable).join(" ") || "";

  const noteWidth = AbcConfig.noteWidth + 2 * AbcConfig.notePadding;
  const textWidth = lyrics.length * 10 * (24 / AbcConfig.textSize) + 2 * AbcConfig.textPadding;
  const width = Math.max(noteWidth, textWidth);
  const height = AbcConfig.topSpacing + 5 * AbcConfig.lineSpacing + AbcConfig.textSpacing + (lyrics.length === 0 ? 0 : (AbcConfig.textSize)) + AbcConfig.bottomSpacing;
  const textHeight = AbcConfig.topSpacing + 5 * AbcConfig.lineSpacing + AbcConfig.textSpacing;

  return <View style={styles.container}>
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <G scale={scale} y={AbcConfig.topSpacing}>
        <Lines />

        <G x={width / 2}>
          {item.pitches.map((it, index) =>
            <Note key={index + "_" + it.pitch}
                  pitch={it}
                  note={item} />
          )}
        </G>

        <Text fontSize={AbcConfig.textSize}
              x={width / 2}
              y={textHeight}
              fill={"#000"}
              textAnchor={"middle"}>
          {lyrics}
        </Text>
      </G>
    </Svg>
  </View>;
};

const styles = StyleSheet.create({
  container: {}
});

export default VoiceItemNoteElement;
