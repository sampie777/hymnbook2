import React, { memo } from "react";
import { Animated, StyleSheet } from "react-native";
import { AbcGui } from "../../../../../logic/songs/abc/gui";
import { AbcConfig } from "../../config";
import Note from "./Note";
import { VoiceItemNote } from "../../../../../logic/songs/abc/abcjsTypes";
import Rest from "./Rest";
import LinesSvg from "../../other/LinesSvg";
import { AnimatedG, AnimatedSvg } from "../../../utils";

interface Props {
  note: VoiceItemNote;
  animatedScale: Animated.Value;
}

const NoteElement: React.FC<Props> = ({
                                        note,
                                        animatedScale
                                      }) => {
  const styles = createStyles();
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
    {/* The following takes 1000 ms to generate */}
    <LinesSvg animatedScale={animatedScale} />

    <AnimatedSvg width={animatedStyle.note.width}
                 height={styles.note.height}
                 style={styles.note}>
      <AnimatedG scale={animatedScale}
                 x={Animated.divide(animatedStyle.note.width, 2)}
                 y={Animated.multiply(animatedScale, AbcConfig.topSpacing)}>
        {/* While the following takes only 400 ms to generate for the same data */}
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
    {melodyComponents}
  </Animated.View>;
};

const createStyles = () => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center"
  },
  note: {
    position: "absolute",
    height: "125%"
  }
});

export default NoteElement
