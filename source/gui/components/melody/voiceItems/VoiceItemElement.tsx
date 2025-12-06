import React from "react";
import VoiceItemNoteElement from "./NoteElement/VoiceItemNoteElement";
import VoiceItemBarElement from "./BarElement/VoiceItemBarElement";
import { SharedValue } from "react-native-reanimated";
import { VoiceItem } from "@hymnbook/abc";

interface Props {
  item: VoiceItem;
  animatedScaleText: SharedValue<number>;
  melodyScale: SharedValue<number>;
}

const VoiceItemElement: React.FC<Props> = ({ item, animatedScaleText, melodyScale }) => {
  switch (item.el_type) {
    case "note":
      return <VoiceItemNoteElement note={item}
                                   animatedScaleText={animatedScaleText}
                                   melodyScale={melodyScale} />;
    case "bar":
      return <VoiceItemBarElement item={item}
                                  melodyScale={melodyScale} />;
    default:
      return null;
  }
};

export default VoiceItemElement;
