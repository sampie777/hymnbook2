import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { ABC } from "../../../logic/songs/abc/abc";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";
import { SharedValue } from "react-native-reanimated";
import { VoiceItem } from "../../../logic/songs/abc/abcjsTypes.ts";

interface Props {
  abc: string;
  animatedScale: SharedValue<number>;
  melodyScale: SharedValue<number>;
  onLoaded: () => void;
  showMelodyOnSeparateLines: boolean
}

const MelodyView: React.FC<Props> = ({ abc, animatedScale, melodyScale, onLoaded, showMelodyOnSeparateLines }) => {
  const abcSong = ABC.parse(abc, showMelodyOnSeparateLines);

  if (abcSong === undefined) return null;

  const multiLineMelody = !showMelodyOnSeparateLines
    ? [abcSong.melody]
    : abcSong.melody
      .reduce<VoiceItem[][]>((previousValue, currentValue) => {
        if (previousValue.length == 0 || (currentValue.el_type == "note" && currentValue.rest?.type == "spacer")) {
          previousValue.push([currentValue])
        } else {
          previousValue[previousValue.length - 1].push(currentValue)
        }
        return previousValue
      }, [])

  return <View onLayout={onLoaded}>
    {multiLineMelody.map((line, lineIndex) =>
      <View key={"line-" + lineIndex} style={styles.container}>
        {lineIndex > 0 ? null : <>
          <Clef melodyScale={melodyScale}
                clef={abcSong.clef} />
          <Key melodyScale={melodyScale}
               keySignature={abcSong.keySignature} />
        </>}
        {line.map((it, index) =>
          <VoiceItemElement key={index}
                            item={it}
                            animatedScaleText={animatedScale}
                            melodyScale={melodyScale}
          />)}
      </View>)}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginLeft: -10,
  }
});

export default memo(MelodyView);
