import React from "react";
import { Animated, StyleSheet } from "react-native";
import { AbcConfig } from "../../config";
import { AbcGui } from "../../../../scripts/songs/abc/gui";
import { VoiceItemNote } from "../../../../scripts/songs/abc/abcjsTypes";
import { ThemeContextProps, useTheme } from "../../../ThemeProvider";
import NoteElement from "./NoteElement";

interface Props {
  note: VoiceItemNote;
  animatedScale: Animated.Value;
  showMelodyLines: boolean;
}

const VoiceItemNoteElement: React.FC<Props> = ({ note, animatedScale, showMelodyLines }) => {
  const styles = createStyles(useTheme());

  const lyrics = note.lyric
    ?.map(it => it.divider !== "-" ? it.syllable : it.syllable + " " + it.divider)
    .join(" ") || "";

  const noteWidth = AbcGui.calculateNoteWidth(note);
  const animatedStyle = {
    container: {
      minWidth: Animated.multiply(noteWidth, animatedScale)
    },
    text: {
      fontSize: Animated.multiply(animatedScale, AbcConfig.textSize),
      lineHeight: Animated.multiply(animatedScale, AbcConfig.textLineHeight),
      paddingHorizontal: Animated.multiply(animatedScale, lyrics.endsWith("-") ? 1 : 5),
      right: Animated.multiply(animatedScale, lyrics.endsWith("-") ? -3: 0)
    }
  };


  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <NoteElement showMelodyLines={showMelodyLines}
                 note={note}
                 animatedScale={animatedScale} />
    <Animated.Text style={[styles.text, animatedStyle.text]}>{lyrics}</Animated.Text>
  </Animated.View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "column",
    flexGrow: 1,
    flexShrink: 1
  },
  text: {
    color: colors.text,
    textAlign: "center",
    fontFamily: "Roboto"
  }
});

export default VoiceItemNoteElement;
