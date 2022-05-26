import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { AbcConfig } from "./config";
import Settings from "../../settings";
import { ABC } from "../../scripts/songs/abc/abc";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";

interface Props {
  abc: string;
  animatedScale: Animated.Value;
  onLoaded: () => void;
}

const MelodyView: React.FC<Props> = ({ abc, animatedScale, onLoaded }) => {
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const [showMelodyLines, setShowMelodyLines] = useState(false);
  const [abcSong, setAbcSong] = useState<ABC.Song | undefined>(undefined);

  const animatedTotalScale = Animated.multiply(animatedScale,
    AbcConfig.baseScale * Settings.songMelodyScale) as unknown as Animated.Value;

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
    <Clef animatedScale={animatedTotalScale}
          clef={abcSong.clef} />
    <Key animatedScale={animatedTotalScale}
         keySignature={abcSong.keySignature} />

    {abcSong.melody.map((it, index) =>
      <VoiceItemElement key={index}
                        item={it}
                        showMelodyLines={showMelodyLines}
                        animatedScale={animatedTotalScale} />)}
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
