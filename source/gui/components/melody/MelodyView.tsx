import React, { memo, useMemo } from "react";
import { getFontScaleSync } from "react-native-device-info";
import { Animated, StyleSheet, View } from "react-native";
import { AbcConfig } from "./config";
import { ABC } from "../../../logic/songs/abc/abc";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";

interface Props {
  abc: string;
  animatedScale: Animated.Value;
  melodyScale: Animated.Value;
  onLoaded: () => void;
}

const MelodyView: React.FC<Props> = ({ abc, animatedScale, melodyScale, onLoaded }) => {
  const animatedScaleMelody = useMemo(() =>
    Animated.multiply(animatedScale,
      Animated.multiply(getFontScaleSync(),
        Animated.multiply(AbcConfig.baseScale, melodyScale))) as unknown as Animated.Value, [])

  const abcSong = ABC.parse(abc);

  if (abcSong === undefined) return null;

  return <View style={styles.container} onLayout={onLoaded}>
    <Clef animatedScale={animatedScaleMelody}
          clef={abcSong.clef} />
    <Key animatedScale={animatedScaleMelody}
         keySignature={abcSong.keySignature} />

    {abcSong.melody.map((it, index) =>
      <VoiceItemElement key={index}
                        item={it}
                        animatedScaleText={animatedScale}
                        animatedScaleMelody={animatedScaleMelody}
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
