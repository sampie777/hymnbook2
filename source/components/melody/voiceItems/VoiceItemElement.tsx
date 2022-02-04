import React from "react";
import { VoiceItem } from "../../../scripts/songs/abc/abcjsTypes";
import VoiceItemNoteElement from "./VoiceItemNoteElement";
import VoiceItemBarElement from "./VoiceItemBarElement";

interface Props {
  item: VoiceItem;
  verticalSpacing: number;
}

const VoiceItemElement: React.FC<Props> = ({ item, verticalSpacing }) => {

  switch (item.el_type) {
    case "note":
      return <VoiceItemNoteElement note={item} scale={verticalSpacing} />;
    case "bar":
      return <VoiceItemBarElement item={item} scale={verticalSpacing} />;
    default:
      return null;
  }
};

export default VoiceItemElement;
