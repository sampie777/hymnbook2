import React from "react";
import { StyleSheet } from "react-native";
import Settings from "../../../../../settings";
import { AbcConfig } from "../../config";
import { AbcGui } from "../../../../../logic/songs/abc/gui";
import { ThemeContextProps, useTheme } from "../../../providers/ThemeProvider";
import NoteElement from "./NoteElement";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { VoiceItemNote } from "@hymnbook/abc";

interface Props {
  note: VoiceItemNote;
  animatedScaleText: SharedValue<number>;
  melodyScale: SharedValue<number>;
  showChords: boolean;
}

const VoiceItemNoteElement: React.FC<Props> = ({ note, animatedScaleText, melodyScale, showChords }) => {
  const styles = createStyles(useTheme());

  const lyrics = note.lyric
    ?.map(it => it.divider !== "-" ? it.syllable : it.syllable + "" + it.divider)
    .join(" ") || "";

  const noteWidth = AbcGui.calculateNoteWidth(note);
  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      minWidth: melodyScale.value * noteWidth
    })),
    text: useAnimatedStyle(() => ({
      marginTop: animatedScaleText.value * 7,
      fontSize: animatedScaleText.value * AbcConfig.textSize,
      lineHeight: animatedScaleText.value * AbcConfig.textLineHeight,
      paddingHorizontal: animatedScaleText.value * (lyrics.endsWith("-") ? 1 : 5),
      right: animatedScaleText.value * (lyrics.endsWith("-") ? -4 : 0)
    })),
  };

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <NoteElement note={note}
                 melodyScale={melodyScale}
                 showChords={showChords}/>

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
    flexShrink: 1,
    marginHorizontal: -1,
  },
  text: {
    color: colors.text.default,
    textAlign: "center",
  }
});

export default VoiceItemNoteElement;
