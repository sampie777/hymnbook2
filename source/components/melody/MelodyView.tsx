import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";
import { ABC } from "../../scripts/songs/abc/abc";
import Settings from "../../settings";
import { AbcConfig } from "./voiceItems/config";

interface Props {
  scale: number;
  abc: string;
}

const MelodyView: React.FC<Props> = ({ scale, abc }) => {
  const [abcSong, setAbcSong] = useState<ABC.Song | undefined>(undefined);

  useEffect(() => {
    setAbcSong(ABC.parse(abc));
  }, [abc])

  if (abcSong === undefined) {
    return null;
  }

  const totalScale = AbcConfig.baseScale * Settings.songMelodyScale * scale;
  return <View style={styles.container}>
    <Clef scale={totalScale} clef={abcSong.clef} />
    <Key scale={totalScale} keySignature={abcSong.keySignature} />

    {abcSong.melody.map((it, index) =>
      <VoiceItemElement key={index} item={it} scale={totalScale} />)}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginLeft: -10
  }
});

export default MelodyView;
