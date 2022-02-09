import React from "react";
import { ABC } from "../../scripts/songs/abc/abc";
import Clef from "./other/Clef";
import Key from "./other/Key";
import { ThemeContextProps, useTheme } from "../ThemeProvider";
import { ScrollView, StyleSheet, View } from "react-native";
import VoiceItemElement from "./voiceItems/VoiceItemElement";

interface ComponentProps {
}

const MelodyTest2: React.FC<ComponentProps>
  = ({}) => {
  const styles = createStyles(useTheme());
  const scale = 1;

  const data = "X:1\n" +
    "T: this is the title\n" +
    "K: A\n" +
    "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    "w: ik ben_ ge-test of niet waar~ik dan ook end_\n";

  const song = ABC.parse(data);

  if (song === undefined) {
    return null;
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Clef scale={scale} clef={song.clef} />
        <Key scale={scale} keySignature={song.keySignature} />

        {song?.melody.map((it, index) =>
          <VoiceItemElement key={index} item={it} verticalSpacing={scale} />)}

      </View>
    </ScrollView>
  );
};

export default MelodyTest2;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  }
});
