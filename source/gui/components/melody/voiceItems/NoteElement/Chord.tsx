import React from "react";
import { StyleSheet } from "react-native";
import { VoiceItemNote } from "@hymnbook/abc";
import { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { ThemeContextProps, useTheme } from "../../../providers/ThemeProvider.tsx";
import { AbcConfig } from "../../config.ts";
import { AnimatedSafeText } from "../../../SafeText.tsx";

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

  return <AnimatedSafeText style={[styles.container, animatedStyles.container]}>
    {(note?.chord ?? []).map(it => it.name).join(" ")}
  </AnimatedSafeText>
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
