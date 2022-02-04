import React from "react";
import { StyleSheet, View } from "react-native";
import { VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import Svg, { G, Text } from "react-native-svg";
import Lines from "./Lines";
import { AbcConfig } from "./config";
import Note from "./Note";

interface Props {
  item: VoiceItemNote;
  scale: number;
}

const VoiceItemNoteElement: React.FC<Props> = ({ item, scale }) => {
  const lyrics = item.lyric?.map(it => it.syllable).join(" ") || "";

  const noteWidth = AbcConfig.noteWidth + 2 * AbcConfig.notePadding
    + (item.pitches.some(it => it.accidental !== undefined) ? AbcConfig.accidentalWidth : 0);
  const textWidth = lyrics.length * 10 * (24 / AbcConfig.textSize) + 2 * AbcConfig.textPadding;
  const width = Math.max(noteWidth, textWidth);
  const height = AbcConfig.topSpacing + 5 * AbcConfig.lineSpacing + AbcConfig.textSpacing + (lyrics.length === 0 ? 0 : (AbcConfig.textSize)) + AbcConfig.bottomSpacing;
  const textHeight = AbcConfig.topSpacing + 5 * AbcConfig.lineSpacing + AbcConfig.textSpacing;

  return <View style={styles.container}>
    <Svg width={width * scale} height={height * scale} viewBox={`0 0 ${width * scale} ${height * scale}`}>
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
