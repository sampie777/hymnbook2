import React from "react";
import { StyleSheet } from "react-native";
import { VoiceItemNote } from "@hymnbook/abc";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { ThemeContextProps, useTheme } from "../../../providers/ThemeProvider.tsx";
import { AbcConfig } from "../../config.ts";

interface Props {
  note?: VoiceItemNote;
  melodyScale: SharedValue<number>;
}

const Chord: React.FC<Props> = ({ note, melodyScale }) => {
  const styles = createStyles(useTheme());

  const animatedStyles = {
    container: useAnimatedStyle(() => ({
      fontSize: melodyScale.value * AbcConfig.chordSize,
    })),
  }

  return <Animated.Text style={[styles.container, animatedStyles.container]}>
    {(note?.chord ?? []).map(it => it.name).join(" ")}
  </Animated.Text>
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    color: colors.notes.color,
    textAlign: "center",
    position: "absolute",
    fontFamily: fontFamily.sansSerifLight
  },
});

export default Chord;
