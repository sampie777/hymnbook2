import React from "react";
import { Animated as RNAnimated, StyleSheet } from "react-native";
import Settings from "../../../../../settings";
import { AbcConfig } from "../../config";
import { AbcGui } from "../../../../../logic/songs/abc/gui";
import { VoiceItemNote } from "../../../../../logic/songs/abc/abcjsTypes";
import { ThemeContextProps, useTheme } from "../../../providers/ThemeProvider";
import NoteElement from "./NoteElement";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface Props {
  note: VoiceItemNote;
  animatedScaleText: SharedValue<number>;
  animatedScaleMelody: RNAnimated.Value;
}

const VoiceItemNoteElement: React.FC<Props> = ({ note, animatedScaleText, animatedScaleMelody }) => {
  const styles = createStyles(useTheme());

  const lyrics = note.lyric
    ?.map(it => it.divider !== "-" ? it.syllable : it.syllable + " " + it.divider)
    .join(" ") || "";

  const noteWidth = AbcGui.calculateNoteWidth(note);
  const animatedStyle = {
    container: {
      minWidth: RNAnimated.multiply(noteWidth, animatedScaleMelody)
    },
    text: useAnimatedStyle(() => ({
      fontSize: animatedScaleText.value * AbcConfig.textSize,
      lineHeight: animatedScaleText.value * AbcConfig.textLineHeight,
      paddingHorizontal: animatedScaleText.value * (lyrics.endsWith("-") ? 1 : 5),
      right: animatedScaleText.value * (lyrics.endsWith("-") ? -3 : 0)
    }))
  };

  return <RNAnimated.View style={[styles.container, animatedStyle.container]}>
    <NoteElement note={note}
                 animatedScale={animatedScaleMelody} />
    <Animated.Text style={[styles.text, animatedStyle.text]}
                   selectable={Settings.enableTextSelection}>
      {lyrics}
    </Animated.Text>
  </RNAnimated.View>;
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
