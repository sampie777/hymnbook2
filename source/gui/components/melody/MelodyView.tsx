import React, { memo, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import Clef from "./other/Clef";
import Key from "./other/Key";
import VoiceItemElement from "./voiceItems/VoiceItemElement";
import { SharedValue, useDerivedValue, useSharedValue } from "react-native-reanimated";
import { getFontScaleSync } from "react-native-device-info";
import { AbcConfig } from "./config.ts";
import * as ABC from "@hymnbook/abc";

interface Props {
  abc: string;
  animatedScale: SharedValue<number>;
  melodyScale: SharedValue<number>;
  onLoaded: () => void;
  showMelodyOnSeparateLines: boolean;
  showMelodyChords: boolean;
}

const MelodyView: React.FC<Props> = ({
                                       abc,
                                       animatedScale,
                                       melodyScale,
                                       onLoaded,
                                       showMelodyOnSeparateLines,
                                       showMelodyChords = false
                                     }) => {
  const fontScaleSync = getFontScaleSync();
  const abcBaseScale = useSharedValue(AbcConfig.baseScale); // Just store the value so it is accesible by the UI thread
  const animatedMelodyScale = useDerivedValue(() =>
      fontScaleSync
      * animatedScale.value
      * melodyScale.value
      * abcBaseScale.value
    , [animatedScale, melodyScale]);

  const abcSong = ABC.parse(abc);

  if (abcSong === undefined) return null;

  const multiLineMelody = showMelodyOnSeparateLines
    ? abcSong.melody
    : [abcSong.melody.flatMap(line => line)]

  const areChordsAvailable = useCallback(() => abcSong.melody.some(line => line.some(it => it.el_type == "note" && it.chord != undefined && it.chord.length > 0)), [abc]);

  const showChords = showMelodyChords && areChordsAvailable();

  return <View onLayout={onLoaded}>
    {multiLineMelody.map((line, lineIndex) =>
      <View key={"line-" + lineIndex} style={styles.container}>
        {lineIndex > 0 ? null : <>
          <Clef melodyScale={animatedMelodyScale}
                clef={abcSong.clef}
                showChords={showChords} />
          <Key melodyScale={animatedMelodyScale}
               keySignature={abcSong.keySignature}
               showChords={showChords} />
        </>}
        {line.map((it, index) =>
          <VoiceItemElement key={index}
                            item={it}
                            animatedScaleText={animatedScale}
                            melodyScale={animatedMelodyScale}
                            showChords={showChords}
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
