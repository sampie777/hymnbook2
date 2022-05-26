import React from "react";
import { Animated } from "react-native";
import { VoiceItemBar } from "../../../../scripts/songs/abc/abcjsTypes";
import BarThinThick from "./BarThinThick";
import BarThin from "./BarThin";

interface Props {
  item: VoiceItemBar;
  animatedScale: Animated.Value;
}

const VoiceItemBarElement: React.FC<Props> = ({ item, animatedScale }) => {
  switch (item.type) {
    case "bar_thin_thick":
      return <BarThinThick animatedScale={animatedScale} />;
    case "bar_thin":
      return <BarThin animatedScale={animatedScale} />;
    default:
      return null;
  }
};

export default VoiceItemBarElement;
