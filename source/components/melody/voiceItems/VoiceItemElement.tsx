import React from "react";
import { Animated } from "react-native";
import { VoiceItem } from "../../../scripts/songs/abc/abcjsTypes";
import VoiceItemNoteElement from "./NoteElement/VoiceItemNoteElement";
import VoiceItemBarElement from "./BarElement/VoiceItemBarElement";

interface Props {
  item: VoiceItem;
  animatedScale: Animated.Value;
  showMelodyLines: boolean;
}

const VoiceItemElement: React.FC<Props> = ({ item, animatedScale, showMelodyLines }) => {
  switch (item.el_type) {
    case "note":
      return <VoiceItemNoteElement note={item}
                                   showMelodyLines={showMelodyLines}
                                   animatedScale={animatedScale} />;
    case "bar":
      return <VoiceItemBarElement item={item}
                                  animatedScale={animatedScale} />;
    default:
      return null;
  }
};

export default VoiceItemElement;
