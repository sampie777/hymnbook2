import React from "react";
import { StyleSheet, View } from "react-native";
import { AbcPitch, StemDirection, VoiceItemBar, VoiceItemNote } from "../../../scripts/songs/abc/abcjsTypes";
import Svg, { Ellipse, G, Line, Rect, Text } from "react-native-svg";
import Lines from "./Lines";

interface Props {
  verticalSpacing: number;
}

const VoiceItemIntroElement: React.FC<Props> = ({ verticalSpacing }) => {
  const padding = verticalSpacing / 10 * 40;
  const width = padding + 5 + 6;
  const height = 12 * verticalSpacing;

  return <View style={styles.container}>
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <G scale={1} y={2}>
        <Lines verticalSpacing={verticalSpacing} />
      </G>
    </Svg>
  </View>;
};

const styles = StyleSheet.create({
  container: {}
});

export default VoiceItemIntroElement;
