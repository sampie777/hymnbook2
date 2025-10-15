import React from "react";
import { Animated as RNAnimated } from "react-native";
import { VoiceItem } from "../../../../logic/songs/abc/abcjsTypes";
import VoiceItemNoteElement from "./NoteElement/VoiceItemNoteElement";
import VoiceItemBarElement from "./BarElement/VoiceItemBarElement";
import { SharedValue } from "react-native-reanimated";

interface Props {
  item: VoiceItem;
  animatedScaleText: SharedValue<number>;
  animatedScaleMelody: RNAnimated.Value;
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
