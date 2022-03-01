import React, { useState } from "react";
import { AbcConfig } from "./config";
import Settings from "../../../settings";
import { AbcGui } from "../../../scripts/songs/abc/gui";
import { VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import { ThemeContextProps, useTheme } from "../../ThemeProvider";
import { StyleSheet, View, Text } from "react-native";
import Svg, { G } from "react-native-svg";
import Note from "./Note";
import Rest from "./Rest";
import Lines from "./Lines";

interface Props {
  note: VoiceItemNote;
  scale: number;
}

const VoiceItemNoteElement: React.FC<Props> = ({ note, scale }) => {
  const [screenWidth, setScreenWidth] = useState(0);
  const styles = createStyles(useTheme());
  const animatedStyle = {
    text: {
      fontSize: Settings.songScale * AbcConfig.textSize,
      lineHeight: Settings.songScale * AbcConfig.textLineHeight
    }
  };

  const lyrics = note.lyric
    ?.map(it => it.divider !== "-" ? it.syllable : it.syllable + " " + it.divider)
    .join(" ") || "";

  const noteWidth = AbcGui.calculateNoteWidth(note);
  const textWidth = AbcGui.calculateTextWidth(lyrics) / scale;
  const width = Math.max(noteWidth, textWidth);

  return <View style={[styles.container, { minWidth: width * scale, flex: lyrics.endsWith("-") ? 1 : 4 }]}
               onLayout={(e) => setScreenWidth(e.nativeEvent.layout.width)}>
    <Svg width={"100%"} height={AbcConfig.totalLineHeight * scale}>
      <G scale={scale} y={AbcConfig.topSpacing * scale}>
        <Lines />

        {screenWidth === 0 ? undefined :
          <G x={screenWidth / 2 / scale}>
            {note.pitches?.map((it, index) =>
              <Note key={index + "_" + it.pitch}
                    pitch={it}
                    note={note} />
            )}
            {note.rest === undefined ? undefined :
              <Rest note={note} />}
          </G>
        }
      </G>
    </Svg>
    <Text style={[styles.text, animatedStyle.text]}>{lyrics}</Text>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1
  },
  text: {
    color: colors.text,
    textAlign: "center",
    fontFamily: "Roboto"
  }
});

export default VoiceItemNoteElement;
