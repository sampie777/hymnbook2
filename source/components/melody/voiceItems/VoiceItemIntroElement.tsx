import React from "react";
import { View } from "react-native";
import { AbcConfig } from "./config";

interface Props {
  scale: number;
}

const VoiceItemIntroElement: React.FC<Props> = ({ scale }) => {
  return <View style={{ width: AbcConfig.introEmptyGapWidth * scale, height: AbcConfig.totalLineHeight * scale }} />;
};

export default VoiceItemIntroElement;
