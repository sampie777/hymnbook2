import React from "react";
import { VoiceItem } from "../../../scripts/songs/abc/abcjsTypes";
import VoiceItemNoteElement from "./VoiceItemNoteElement";

interface Props {
  item: VoiceItem;
}

const VoiceItemElement: React.FC<Props> = ({ item }) => {
  switch (item.el_type) {
    case "note":
      return <VoiceItemNoteElement item={item} />;
    default:
      return null;
  }
};

export default VoiceItemElement;
