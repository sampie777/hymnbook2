import React from "react";
import Animated from "react-native-reanimated";
import { VoiceItem } from "../../../scripts/songs/abc/abcjsTypes";
import VoiceItemNoteElement from "./NoteElement/VoiceItemNoteElement";
import VoiceItemBarElement from "./BarElement/VoiceItemBarElement";

interface Props {
  item: VoiceItem;
  scale: number;
  animatedScale: Animated.Value<number>;
}

const VoiceItemElement: React.FC<Props> = ({ item, scale, animatedScale }) => {
  switch (item.el_type) {
    case "note":
      return <VoiceItemNoteElement note={item}
                                   scale={scale}
                                   animatedScale={animatedScale} />;
    case "bar":
      return <VoiceItemBarElement item={item} scale={scale} />;
    default:
      return null;
  }
};

export default VoiceItemElement;
