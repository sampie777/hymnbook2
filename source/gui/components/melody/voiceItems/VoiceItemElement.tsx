import React, { memo } from "react";
import { Animated } from "react-native";
import { VoiceItem } from "../../../../logic/songs/abc/abcjsTypes";
import VoiceItemNoteElement from "./NoteElement/VoiceItemNoteElement";
import VoiceItemBarElement from "./BarElement/VoiceItemBarElement";

interface Props {
  item: VoiceItem;
  animatedScaleText: Animated.Value;
  animatedScaleMelody: Animated.Value;
}

const VoiceItemElement: React.FC<Props> = ({ item, animatedScaleText, animatedScaleMelody }) => {
  switch (item.el_type) {
    case "note":
      return <VoiceItemNoteElement note={item}
                                   animatedScaleText={animatedScaleText}
                                   animatedScaleMelody={animatedScaleMelody} />;
    case "bar":
      return <VoiceItemBarElement item={item}
                                  animatedScale={animatedScaleMelody} />;
    default:
      return null;
  }
};

export default VoiceItemElement;
