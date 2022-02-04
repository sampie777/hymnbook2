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
  const height = AbcConfig.topSpacing + 5 * AbcConfig.lineSpacing;

  if (item.type === "bar_thin_thick") {
    const paddingLeft = 20;
    const width = paddingLeft + 5 + 6;

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
  }

  if (item.type === "bar_thin") {
    const width = 2 * AbcConfig.notePadding;

    return <View style={styles.container}>
      <Svg width={width * scale} height={height * scale} viewBox={`0 0 ${width * scale} ${height * scale}`}>
        <G scale={scale} y={AbcConfig.topSpacing}>
          <Lines />

          <Line x1={width / 2} y1={0}
                x2={width / 2} y2={4 * AbcConfig.lineSpacing}
                stroke="#333"
                strokeWidth={1.5} />
        </G>
      </Svg>
    </View>;
  }

  return null;
};

const styles = StyleSheet.create({
  container: {}
});

export default VoiceItemBarElement;
