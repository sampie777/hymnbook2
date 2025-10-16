import React from "react";
import { StyleSheet } from "react-native";
import { AbcConfig, useAbcMusicStyle } from "../../config";
import Note from "./Note";
import { VoiceItemNote } from "../../../../../logic/songs/abc/abcjsTypes";
import Rest from "./Rest";
import Lines from "../../other/Lines.tsx";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useTheme } from "../../../providers/ThemeProvider.tsx";

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
    note: useAbcMusicStyle(melodyScale, useTheme())
  };

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <Lines melodyScale={melodyScale}/>

    <Animated.Text style={[styles.note, animatedStyle.note]} ellipsizeMode={"tail"}>
      {"="}
      {/* The following takes 1000 ms to generate */}

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
      {"="}
    </Animated.Text>
  </Animated.View>;
};

const createStyles = () => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
  },
  note: {
    position: "absolute",
    transform: [{scaleX: 1.35}], // Make not a bit fatter so it's easier to see
  }
});

export default NoteElement
