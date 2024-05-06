import React from "react";
import { Animated, StyleSheet } from "react-native";
import Settings from "../../../../../settings";
import { AbcConfig } from "../../config";
import { AbcGui } from "../../../../../logic/songs/abc/gui";
import { VoiceItemNote } from "../../../../../logic/songs/abc/abcjsTypes";
import { ThemeContextProps, useTheme } from "../../../providers/ThemeProvider";
import NoteElement from "./NoteElement";

interface Props {
  note: VoiceItemNote;
  animatedScaleText: Animated.Value;
  animatedScaleMelody: Animated.Value;
  showMelodyLines: boolean;
}

const VoiceItemNoteElement: React.FC<Props> = ({ note, animatedScaleText, animatedScaleMelody, showMelodyLines }) => {
  const styles = createStyles(useTheme());

  const lyrics = note.lyric
    ?.map(it => it.divider !== "-" ? it.syllable : it.syllable + " " + it.divider)
    .join(" ") || "";

  const noteWidth = AbcGui.calculateNoteWidth(note);
  const animatedStyle = {
    container: {
      minWidth: Animated.multiply(noteWidth, animatedScaleMelody)
    },
    text: {
      fontSize: Animated.multiply(animatedScaleText, AbcConfig.textSize),
      lineHeight: Animated.multiply(animatedScaleText, AbcConfig.textLineHeight),
      paddingHorizontal: Animated.multiply(animatedScaleText, lyrics.endsWith("-") ? 1 : 5),
      right: Animated.multiply(animatedScaleText, lyrics.endsWith("-") ? -3 : 0)
    }
  };

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <NoteElement showMelodyLines={showMelodyLines}
                 note={note}
                 animatedScale={animatedScaleMelody} />
    <Animated.Text style={[styles.text, animatedStyle.text]}
                   selectable={Settings.enableTextSelection}>
      {lyrics}
    </Animated.Text>
  </Animated.View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "column",
    flexGrow: 1,
    flexShrink: 1
  },
  text: {
    color: colors.text.default,
    textAlign: "center"
  }
});

export default VoiceItemNoteElement;
