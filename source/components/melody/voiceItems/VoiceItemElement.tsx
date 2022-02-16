import React from "react";
import { VoiceItem } from "../../../scripts/songs/abc/abcjsTypes";
import VoiceItemNoteElement from "./VoiceItemNoteElement";
import VoiceItemBarElement from "./VoiceItemBarElement";

interface Props {
  item: VoiceItem;
  scale: number;
}

const VoiceItemElement: React.FC<Props> = ({ item, scale }) => {

  switch (item.el_type) {
    case "note":
      return <VoiceItemNoteElement note={item} scale={scale} />;
    case "bar":
      return <VoiceItemBarElement item={item} scale={scale} />;
    default:
      return null;
  }
};

export default VoiceItemElement;
