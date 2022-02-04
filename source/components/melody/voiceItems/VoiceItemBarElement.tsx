import React from "react";
import { StyleSheet, View } from "react-native";
import { VoiceItemBar } from "../../../scripts/songs/abc/abcjsTypes";
import Svg, { G, Line } from "react-native-svg";
import Lines from "./Lines";
import { AbcConfig } from "./config";

interface Props {
  item: VoiceItemBar;
  scale: number;
}

const VoiceItemBarElement: React.FC<Props> = ({ item, scale }) => {
  if (item.type !== "bar_thin_thick") {
    return null;
  }

  const paddingLeft = 30;
  const width = paddingLeft + 5 + 6;
  const height = AbcConfig.topSpacing + 5 * AbcConfig.lineSpacing + AbcConfig.bottomSpacing;

  return <View style={styles.container}>
    <Svg width={width * scale} height={height * scale} viewBox={`0 0 ${width * scale} ${height * scale}`}>
      <G scale={scale} y={AbcConfig.topSpacing}>
        <Lines />

        <Line x1={paddingLeft} y1={0}
              x2={paddingLeft} y2={4 * AbcConfig.lineSpacing}
              stroke="#333"
              strokeWidth={1.5} />

        <Line x1={paddingLeft + 8} y1={0}
              x2={paddingLeft + 8} y2={4 * AbcConfig.lineSpacing}
              stroke="#333"
              strokeWidth={8} />
      </G>
    </Svg>
  </View>;
};

const styles = StyleSheet.create({
  container: {}
});

export default VoiceItemBarElement;
