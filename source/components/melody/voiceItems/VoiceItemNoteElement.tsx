import React, { useState } from "react";
import { AbcConfig } from "./config";
import Note from "./Note";
import Rest from "./Rest";
import Lines from "./Lines";
import { AbcGui } from "../../../scripts/songs/abc/gui";
import Svg, { Color, G, Text } from "react-native-svg";
import { ThemeContextProps, useTheme } from "../../ThemeProvider";
import { StyleSheet, View } from "react-native";
import { VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";

interface Props {
  note: VoiceItemNote;
  scale: number;
}

const VoiceItemNoteElement: React.FC<Props> = ({ note, scale }) => {
  const [screenWidth, setScreenWidth] = useState(0);
  const styles = createStyles(useTheme());

  const lyrics = note.lyric
    ?.map(it => it.divider !== "-" ? it.syllable : it.syllable + " " + it.divider)
    .join(" ") || "";

  const noteWidth = AbcGui.calculateNoteWidth(note);
  const textWidth = lyrics.length * 10 * (24 / AbcConfig.textSize) + 2 * AbcConfig.textPadding;
  const width = Math.max(noteWidth, textWidth);
  const textHeight = AbcConfig.topSpacing + 5 * AbcConfig.lineSpacing + AbcConfig.textSpacing;

  return <View style={[styles.container, { minWidth: width * scale }]}
               onLayout={(e) => setScreenWidth(e.nativeEvent.layout.width)}>
    <Svg width={"100%"} height={AbcConfig.totalLineHeight * scale}
         viewBox={`0 0 ${screenWidth} ${AbcConfig.totalLineHeight * scale}`}>
      <G scale={scale} y={AbcConfig.topSpacing * scale}>
        <Lines />

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
              fill={styles.text.color as Color}
              textAnchor={"middle"}>
          {lyrics}
        </Text>
      </G>
    </Svg>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: colors.text
  }
});

export default VoiceItemNoteElement;
