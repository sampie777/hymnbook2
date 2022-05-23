import React from "react";
import { AbcConfig } from "./config";
import Settings from "../../../settings";
import { AbcGui } from "../../../scripts/songs/abc/gui";
import { VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import { ThemeContextProps, useTheme } from "../../ThemeProvider";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import Svg, { G } from "react-native-svg";
import Note from "./Note";
import Rest from "./Rest";
import Lines from "./Lines";

interface Props {
  note: VoiceItemNote;
  scale: number;
  animatedScale: Animated.Value<number>;
}

const VoiceItemNoteElement: React.FC<Props> = ({ note, scale, animatedScale }) => {
  const styles = createStyles(useTheme());

  const lyrics = note.lyric
    ?.map(it => it.divider !== "-" ? it.syllable : it.syllable + " " + it.divider)
    .join(" ") || "";

  const noteWidth = AbcGui.calculateNoteWidth(note);
  const textWidth = AbcGui.calculateTextWidth(lyrics, Settings.songScale) / scale;
  const width = Math.max(noteWidth, textWidth) * scale;
  const animatedStyle = {
    container: {
      minWidth: Settings.animateMelodyScale ?
        Animated.multiply(width, animatedScale) : width,
      flex: lyrics.endsWith("-") ? 1 : 4
    },
    text: {
      fontSize: Settings.animateMelodyScale ?
        Animated.multiply(animatedScale, AbcConfig.textSize) :
        Settings.songScale * AbcConfig.textSize,
      lineHeight: Settings.animateMelodyScale ?
        Animated.multiply(animatedScale, AbcConfig.textLineHeight) : Settings.songScale * AbcConfig.textLineHeight
    },
    note: {
      width: Animated.multiply(animatedScale, noteWidth),
      height: Animated.multiply(animatedScale, AbcConfig.totalLineHeight)
    }
  };

  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <View style={styles.noteContainer}>
      <AnimatedSvg width={"100%"}
                   height={AbcConfig.totalLineHeight * scale}>
        <G scale={scale} y={AbcConfig.topSpacing * scale}>
          <Lines />
        </G>
      </AnimatedSvg>

      <AnimatedSvg width={animatedStyle.note.width}
                   height={animatedStyle.note.height}
                   style={{ position: "absolute" }}>
        <G scale={scale} x={noteWidth / 2} y={AbcConfig.topSpacing * scale}>
          {note.pitches?.map((it, index) =>
            <Note key={index + "_" + it.pitch}
                  pitch={it}
                  note={note} />
          )}
          {note.rest === undefined ? undefined :
            <Rest note={note} />}
        </G>
      </AnimatedSvg>
    </View>

    <Animated.Text style={[styles.text, animatedStyle.text]}>{lyrics}</Animated.Text>
  </Animated.View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
  },
  noteContainer: {
    flexDirection: "row",
    justifyContent: "center"
  },
  text: {
    color: colors.text,
    textAlign: "center",
    fontFamily: "Roboto"
  }
});

export default VoiceItemNoteElement;
