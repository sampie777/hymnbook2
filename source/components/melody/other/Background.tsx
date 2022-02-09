import React, { useState } from "react";
import { Dimensions, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { AbcConfig } from "../voiceItems/config";
import Svg, { G } from "react-native-svg";
import Lines from "../voiceItems/Lines";

const Line: React.FC<{ scale: number, width: number }>
  = ({ scale, width }) => {
  return <Svg width={width * scale} height={AbcConfig.totalLineHeight * scale}
              viewBox={`0 0 ${width * scale} ${AbcConfig.totalLineHeight * scale}`}>
    <G scale={scale} y={AbcConfig.topSpacing * scale}>
      <Lines width={width} />
    </G>
  </Svg>;
};

interface Props {
  scale: number;
}

const Background: React.FC<Props> = ({ scale }) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [lineCount, setLineCount] = useState(1);


  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const newLineCount = Math.round(height / AbcConfig.totalLineHeight);

    setScreenWidth(width);
    setLineCount(newLineCount);
  };

  return <View style={styles.container} onLayout={onLayout}>
    {Array.from({ length: lineCount }, (_, i) =>
      <Line key={i} scale={scale} width={screenWidth} />)}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    height: "100%",
    width: "100%"
  }
});

export default Background;
