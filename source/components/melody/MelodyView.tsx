import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";
import { ABC } from "../../scripts/songs/abc/abc";
import Settings from "../../settings";
import { AbcConfig } from "./config";

interface Props {
  scale: number;
  abc: string;
  animatedScale: Animated.Value<number>;
  onLoaded: () => void;
}

const MelodyView: React.FC<Props> = ({ scale, abc, animatedScale, onLoaded }) => {
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const [showMelodyLines, setShowMelodyLines] = useState(false);
  const [abcSong, setAbcSong] = useState<ABC.Song | undefined>(undefined);

  const totalScale = AbcConfig.baseScale * Settings.songMelodyScale * scale;

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
    <Clef scale={totalScale}
          clef={abcSong.clef} />
    <Key scale={totalScale}
         keySignature={abcSong.keySignature} />

    {abcSong.melody.map((it, index) =>
      <VoiceItemElement key={index}
                        item={it}
                        showMelodyLines={showMelodyLines}
                        scale={totalScale}
                        animatedScale={animatedScale} />)}
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
