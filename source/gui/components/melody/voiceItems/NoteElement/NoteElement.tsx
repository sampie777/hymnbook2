import React from "react";
import { StyleSheet } from "react-native";
import { AbcConfig, useAbcMusicStyle } from "../../config";
import Note from "./Note";
import { VoiceItemNote } from "@hymnbook/abc";
import Rest from "./Rest";
import Lines from "../../other/Lines.tsx";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useTheme } from "../../../providers/ThemeProvider.tsx";
import Chord from "./Chord.tsx";

interface Props {
  note?: VoiceItemNote;
  melodyScale: SharedValue<number>;
  customNote?: string;
  showChords: boolean;
}

const NoteElement: React.FC<Props> = ({
                                        note,
                                        melodyScale,
                                        customNote,
                                        showChords,
                                      }) => {
  const styles = createStyles();

  const animatedStyle = {
    container: useAnimatedStyle(() => ({
      marginBottom: melodyScale.value * -15,
      paddingTop: !showChords ? undefined : melodyScale.value * AbcConfig.chordTopSpace,  // todo: This doesn't update correctly if `showChords` changes
    }), [showChords]),
    note: useAbcMusicStyle(melodyScale, useTheme()),
  }

  return <Animated.View style={[styles.container, animatedStyle.container]}>
    <Lines melodyScale={melodyScale} showChords={showChords} />

    {showChords && <Chord note={note} melodyScale={melodyScale} />}

    <Animated.Text style={[styles.note, animatedStyle.note, (customNote ? { transform: undefined } : {})]}
                   ellipsizeMode={"tail"}>
      {!note ? customNote : <>
        {" "}
        {note.pitches === undefined ? undefined :
          note.pitches?.map((it, index) =>
            <Note key={index + "_" + it.pitch}
                  pitch={it}
                  duration={note.duration} />
          )
        }
        <Rest note={note} />
        {" "}
      </>}
    </Animated.Text>
  </Animated.View>;
};

const createStyles = () => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    overflow: "hidden",
  },
  note: {
    transform: [{ scaleX: 1.35 }], // Make not a bit fatter so it's easier to see
  }
});

export default NoteElement
