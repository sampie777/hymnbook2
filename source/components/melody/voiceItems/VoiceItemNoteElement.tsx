import React from "react";
import { StyleSheet, View } from "react-native";
import { VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import Svg, { G, Text } from "react-native-svg";
import { AbcConfig } from "./config";
import Note from "./Note";
import Rest from "./Rest";
import { AbcGui } from "../../../scripts/songs/abc/gui";

interface Props {
  note: VoiceItemNote;
  scale: number;
}

const VoiceItemNoteElement: React.FC<Props> = ({ note, scale }) => {
  const lyrics = note.lyric
    ?.map(it => it.divider !== "-" ? it.syllable : it.syllable + " " + it.divider)
    .join(" ") || "";

  const noteWidth = AbcGui.calculateNoteWidth(note);
  const textWidth = lyrics.length * 10 * (24 / AbcConfig.textSize) + 2 * AbcConfig.textPadding;
  const width = Math.max(noteWidth, textWidth);
  const textHeight = AbcConfig.topSpacing + 5 * AbcConfig.lineSpacing + AbcConfig.textSpacing;

  return <View style={styles.container}>
    <Svg width={width * scale} height={AbcConfig.totalLineHeight * scale}
         viewBox={`0 0 ${width * scale} ${AbcConfig.totalLineHeight * scale}`}>
      <G scale={scale} y={AbcConfig.topSpacing * scale}>
        <G x={width / 2}>
          {note.pitches?.map((it, index) =>
            <Note key={index + "_" + it.pitch}
                  pitch={it}
                  note={note} />
          )}
          {note.rest === undefined ? undefined :
            <Rest note={note} />}
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
