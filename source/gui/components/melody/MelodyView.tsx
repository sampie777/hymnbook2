import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { AbcConfig } from "./config";
import { ABC } from "../../../logic/songs/abc/abc";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";

interface Props {
  abc: string;
  animatedScale: Animated.Value;
  melodyScale: number;
  onLoaded: () => void;
}

const MelodyView: React.FC<Props> = ({ abc, animatedScale, melodyScale, onLoaded }) => {
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const [showMelodyLines, setShowMelodyLines] = useState(false);
  const [abcSong, setAbcSong] = useState<ABC.Song | undefined>(undefined);

  const animatedScaleMelody = Animated.multiply(animatedScale,
    AbcConfig.baseScale * melodyScale) as unknown as Animated.Value;

  useEffect(() => {
    setAbcSong(ABC.parse(abc));
  }, [abc]);

  if (abcSong === undefined) {
    return null;
  }

  const onLayoutLoaded = () => {
    onLoaded();
    setIsLayoutLoaded(true);
    setShowMelodyLines(true);
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
                        showMelodyLines={showMelodyLines}
                        animatedScaleText={animatedScale}
                        animatedScaleMelody={animatedScaleMelody} />)}
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
