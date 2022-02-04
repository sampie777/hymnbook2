import React from "react";
import { StyleSheet, View } from "react-native";
import { VoiceItemBar } from "../../../scripts/songs/abc/abcjsTypes";
import Svg, { G, Line } from "react-native-svg";
import Lines from "./Lines";

interface Props {
  item: VoiceItemBar;
  verticalSpacing: number;
}

const VoiceItemBarElement: React.FC<Props> = ({ item, verticalSpacing }) => {
  if (item.type !== "bar_thin_thick") {
    return null;
  }

  const padding = verticalSpacing / 10 * 20;
  const width = padding + 5 + 6;
  const height = 5 * verticalSpacing;

  return <View style={styles.container}>
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <G scale={1} y={2}>
        <Lines verticalSpacing={verticalSpacing} />

        <Line x1={padding} y1={0 * verticalSpacing}
              x2={padding} y2={4 * verticalSpacing}
              stroke="#333"
              strokeWidth={1.5} />

        <Line x1={padding + 8} y1={0 * verticalSpacing}
              x2={padding + 8} y2={4 * verticalSpacing}
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
