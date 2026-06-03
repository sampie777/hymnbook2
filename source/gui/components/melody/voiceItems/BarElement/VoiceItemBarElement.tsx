import React from "react";
import { VoiceItemBar } from "@hymnbook/abc";
import { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { AbcConfig, useAbcMusicStyle } from "../../config.ts";
import { useTheme } from "../../../providers/ThemeProvider.tsx";
import { AnimatedSafeText } from "../../../SafeText.tsx";

interface Props {
  item: VoiceItemBar;
  melodyScale: SharedValue<number>;
  showChords: boolean;
}

const VoiceItemBarElement: React.FC<Props> = ({ item, melodyScale, showChords }) => {
  const animatedStyles = {
    container: useAnimatedStyle(() => ({
      paddingTop: !showChords ? undefined : melodyScale.value * AbcConfig.chordTopSpace,
    })),
    melody: useAbcMusicStyle(melodyScale, useTheme())
  };

  return <AnimatedSafeText style={[animatedStyles.container, animatedStyles.melody]}>
    {item.type == "bar_thin_thick" ? "." : ""}
    {item.type == "bar_thin" ? "Ā" : ""}
  </AnimatedSafeText>
};

export default VoiceItemBarElement;
