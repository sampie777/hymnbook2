import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../ThemeProvider";
import { AbcGui } from "../../../../scripts/songs/abc/gui";
import Animated from "react-native-reanimated";
import { AbcConfig } from "../config";
import Svg, { G } from "react-native-svg";
import Note from "../Note";
import { VoiceItemNote } from "../../../../scripts/songs/abc/abcjsTypes";
import Rest from "../Rest";
import LinesSvg from "../LinesSvg";

interface Props {
  note: VoiceItemNote;
  scale: number;
  animatedScale: Animated.Value<number>;
}

const NoteElement: React.FC<Props> = ({ note, scale, animatedScale }) => {
  const styles = createStyles(useTheme());

  const noteWidth = AbcGui.calculateNoteWidth(note);
  const animatedStyle = {
    note: {
      width: Animated.multiply(animatedScale, noteWidth),
      height: Animated.multiply(animatedScale, AbcConfig.totalLineHeight)
    }
  };

  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

  return <View style={styles.container}>
    <LinesSvg scale={scale} />

    <AnimatedSvg width={animatedStyle.note.width}
                 height={animatedStyle.note.height}
                 style={{ position: "absolute" }}>
      <G scale={scale} x={noteWidth / 2} y={AbcConfig.topSpacing * scale}>
        {note.pitches === undefined ? undefined :
          note.pitches?.map((it, index) =>
            <Note key={index + "_" + it.pitch}
                  pitch={it}
                  duration={note.duration} />
          )
        }
        {note.rest === undefined ? undefined :
          <Rest note={note} />
        }
      </G>
    </AnimatedSvg>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center"
  }
});

const propsAreEqual = (prevProps: Props, nextProps: Props): boolean =>
  prevProps.scale === nextProps.scale &&
  prevProps.note.rest?.type === nextProps.note.rest?.type &&
  prevProps.note.duration === nextProps.note.duration &&
  prevProps.note.pitches?.length === nextProps.note.pitches?.length &&
  (
    (prevProps.note.pitches === undefined && nextProps.note.pitches === undefined) ||
    ((prevProps.note.pitches !== undefined && nextProps.note.pitches !== undefined) &&
      prevProps.note.pitches?.every((it, i) =>
        it.pitch === nextProps.note.pitches![i].pitch &&
        it.accidental === nextProps.note.pitches![i].accidental
      )
    )
  );

export default memo(NoteElement, propsAreEqual);
