import React from "react";
import { VoiceItemBar } from "../../../../scripts/songs/abc/abcjsTypes";
import BarThinThick from "./BarThinThick";
import BarThin from "./BarThin";

interface Props {
  item: VoiceItemBar;
  scale: number;
}

const VoiceItemBarElement: React.FC<Props> = ({ item, scale }) => {
  switch (item.type) {
    case "bar_thin_thick":
      return <BarThinThick scale={scale} />;
    case "bar_thin":
      return <BarThin scale={scale} />;
    default:
      return null;
  }
};

export default VoiceItemBarElement;
