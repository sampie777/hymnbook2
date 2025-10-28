import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { ABC } from "../../../logic/songs/abc/abc";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";
import { SharedValue } from "react-native-reanimated";

interface Props {
  abc: string;
  animatedScale: SharedValue<number>;
  melodyScale: SharedValue<number>;
  onLoaded: () => void;
}

const MelodyView: React.FC<Props> = ({ abc, animatedScale, melodyScale, onLoaded }) => {
  const abcSong = ABC.parse(abc);

  if (abcSong === undefined) return null;

  return <View style={styles.container} onLayout={onLoaded}>
    <Clef melodyScale={melodyScale}
          clef={abcSong.clef} />
    <Key melodyScale={melodyScale}
         keySignature={abcSong.keySignature} />

    {abcSong.melody.map((it, index) =>
      <VoiceItemElement key={index}
                        item={it}
                        animatedScaleText={animatedScale}
                        melodyScale={melodyScale}
      />)}
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

export default memo(MelodyView);
