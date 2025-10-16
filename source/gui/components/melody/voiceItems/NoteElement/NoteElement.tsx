import React from "react";
import { StyleSheet } from "react-native";
import { useAbcMusicStyle } from "../../config";
import Note from "./Note";
import { VoiceItemNote } from "../../../../../logic/songs/abc/abcjsTypes";
import Rest from "./Rest";
import Lines from "../../other/Lines.tsx";
import Animated, { SharedValue } from "react-native-reanimated";
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

  const animatedStyle = useAbcMusicStyle(melodyScale, useTheme())

  return <Animated.View style={styles.container}>
    <Lines melodyScale={melodyScale}/>

    <Animated.Text style={[styles.note, animatedStyle]} ellipsizeMode={"tail"}>
      {"=="}
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
      {"=="}
    </Animated.Text>
  </Animated.View>;
};

const createStyles = () => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    overflow: "hidden"
  },
  note: {
    position: "absolute",
    transform: [{scaleX: 1.35}], // Make not a bit fatter so it's easier to see
  }
});

export default NoteElement
