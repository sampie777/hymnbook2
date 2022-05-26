import React, { memo } from "react";
import { Animated, StyleSheet } from "react-native";
import { ThemeContextProps, useTheme } from "../../../ThemeProvider";
import { AbcGui } from "../../../../scripts/songs/abc/gui";
import { AbcConfig } from "../../config";
import Note from "./Note";
import { VoiceItemNote } from "../../../../scripts/songs/abc/abcjsTypes";
import Rest from "./Rest";
import LinesSvg from "../../other/LinesSvg";
import { AnimatedG, AnimatedSvg } from "../../../utils";

interface Props {
  note: VoiceItemNote;
  showMelodyLines: boolean;
  animatedScale: Animated.Value;
}

const NoteElement: React.FC<Props> = ({
                                        note,
                                        showMelodyLines,
                                        animatedScale
                                      }) => {
  const styles = createStyles(useTheme());
  const noteWidth = AbcGui.calculateNoteWidth(note);

  const animatedStyle = {
    container: {
      height: Animated.multiply(animatedScale, AbcConfig.totalLineHeight)
    },
    note: {
      width: Animated.multiply(animatedScale, noteWidth)
    }
  };

  // Only render melody components after the parent container has rendered,
  // otherwise it will slow the render dramatically and freeze the UI
  const melodyComponents = <>
    <LinesSvg animatedScale={animatedScale} />

    <AnimatedSvg width={animatedStyle.note.width}
                 height={styles.note.height}
                 style={styles.note}>
      <AnimatedG scale={animatedScale}
                 x={Animated.divide(animatedStyle.note.width, 2)}
                 y={Animated.multiply(animatedScale, AbcConfig.topSpacing)}>
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
      </AnimatedG>
    </AnimatedSvg>
  </>;

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    {!showMelodyLines ? undefined : melodyComponents}
  </Animated.View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center"
  },
  note: {
    position: "absolute",
    height: "125%"
  }
});

const propsAreEqual = (prevProps: Props, nextProps: Props): boolean =>
  prevProps.showMelodyLines === nextProps.showMelodyLines &&
  prevProps.animatedScale === nextProps.animatedScale &&
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
