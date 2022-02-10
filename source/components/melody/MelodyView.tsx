import React from "react";
import { StyleSheet, View } from "react-native";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";
import { ABC } from "../../scripts/songs/abc/abc";

interface Props {
  scale: number;
  abc: string;
}

const MelodyView: React.FC<Props> = ({ scale, abc }) => {
  const song = ABC.parse(abc);

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
  }
});

export default MelodyView;
