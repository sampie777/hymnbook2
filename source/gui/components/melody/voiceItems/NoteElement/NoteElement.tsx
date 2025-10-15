import React from "react";
import { StyleSheet } from "react-native";
import { AbcConfig, useAbcMusicStyle } from "../../config";
import Note from "./Note";
import { VoiceItemNote } from "../../../../../logic/songs/abc/abcjsTypes";
import Rest from "./Rest";
import Lines from "../../other/Lines.tsx";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface Props {
  note: VoiceItemNote;
  melodyScale: SharedValue<number>;
}

const NoteElement: React.FC<Props> = ({
                                        note,
                                        melodyScale
                                      }) => {
  const styles = createStyles();

  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      height: melodyScale.value * AbcConfig.totalLineHeight
    })),
    note: useAbcMusicStyle(melodyScale)
  };

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <Animated.Text style={animatedStyle.note}>
      {/* The following takes 1000 ms to generate */}
      <Lines />

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
      <Lines />
    </Animated.Text>
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
