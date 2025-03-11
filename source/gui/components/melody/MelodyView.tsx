import React, { useEffect, useMemo, useState } from "react";
import { getFontScale } from "react-native-device-info";
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
  const [systemFontScale, setSystemFontScale] = useState(1);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const [abcSong, setAbcSong] = useState<ABC.Song | undefined>(undefined);

  getFontScale().then(scale => setSystemFontScale(scale));

  const animatedScaleMelody = useMemo(() =>
    Animated.multiply(animatedScale,
      Animated.multiply(systemFontScale,
        Animated.multiply(AbcConfig.baseScale, melodyScale))) as unknown as Animated.Value, [])

  const memoizedAbc = useMemo(() => ABC.parse(abc), [abc]);

  useEffect(() => {
    setAbcSong(memoizedAbc);
  }, [abc]);

  if (abcSong === undefined) {
    return null;
  }

  const onLayoutLoaded = () => {
    onLoaded();
    setIsLayoutLoaded(true);
  };

  return <View style={[
    styles.container,
    {
      // Hide view while melody is loading
      position: isLayoutLoaded ? "relative" : "absolute",
      opacity: isLayoutLoaded ? 1 : 0
    }
  ]}
               onLayout={onLayoutLoaded}>
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

export default MelodyView;
