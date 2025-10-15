import React, { memo, useMemo } from "react";
import { getFontScaleSync } from "react-native-device-info";
import { Animated as RNAnimated, StyleSheet, View } from "react-native";
import { AbcConfig } from "./config";
import { ABC } from "../../../logic/songs/abc/abc";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";
import { SharedValue } from "react-native-reanimated";

interface Props {
  abc: string;
  animatedScale: SharedValue<number>;
  melodyScale: RNAnimated.Value;
  onLoaded: () => void;
}

const MelodyView: React.FC<Props> = ({ abc, animatedScale, melodyScale, onLoaded }) => {
  const animatedScaleMelody = useMemo(() =>
      RNAnimated.multiply(getFontScaleSync(),
        RNAnimated.multiply(AbcConfig.baseScale, melodyScale)) as unknown as RNAnimated.Value, [])

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
