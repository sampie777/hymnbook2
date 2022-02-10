import React from "react";
import { StyleSheet, View } from "react-native";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";
import { ABC } from "../../scripts/songs/abc/abc";

interface Props {
  scale: number;
}

const MelodyView: React.FC<Props> = ({ scale }) => {
  const data = "X:1\n" +
    "T: this is the title\n" +
    "K: A\n" +
    "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    // "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    // "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    // "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    // "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    // "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    // "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    // "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    // "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    "w: ik ben_ ge-test of niet waar~ik dan ook end_\n";

  const song = ABC.parse(data);

  if (song === undefined) {
    return null;
  }

  return <View style={styles.container}>
    <Clef scale={scale} clef={song.clef} />
    <Key scale={scale} keySignature={song.keySignature} />

    {song?.melody.map((it, index) =>
      <VoiceItemElement key={index} item={it} verticalSpacing={scale} />)}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    paddingHorizontal: 0,
    paddingBottom: 100
  }
});

export default MelodyView;
