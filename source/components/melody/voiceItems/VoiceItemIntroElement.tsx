import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { G } from "react-native-svg";
import Lines from "./Lines";
import { AbcConfig } from "./config";

interface Props {
  scale: number;
}

const VoiceItemIntroElement: React.FC<Props> = ({ scale }) => {
  const width = 40;
  const height = AbcConfig.topSpacing + 5 * AbcConfig.lineSpacing + AbcConfig.bottomSpacing;

  return <View style={styles.container}>
    <Svg width={width * scale} height={height * scale} viewBox={`0 0 ${width * scale} ${height * scale}`}>
      <G scale={scale} y={AbcConfig.topSpacing}>
        <Lines />
      </G>
    </Svg>
  </View>;
};

const styles = StyleSheet.create({
  container: {}
});

export default VoiceItemIntroElement;
