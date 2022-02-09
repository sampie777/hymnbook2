import React, { useState } from "react";
import { Dimensions, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { AbcConfig } from "../voiceItems/config";
import Svg, { G } from "react-native-svg";
import Lines from "../voiceItems/Lines";

interface Props {
  scale: number;
}

const Background: React.FC<Props> = ({ scale }) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get("window").height);
  const [lineCount, setLineCount] = useState(1);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const newLineCount = Math.ceil(height / AbcConfig.totalLineHeight);

    setScreenWidth(width);
    setScreenHeight(height);
    setLineCount(newLineCount);
  };

  return <View style={styles.container} onLayout={onLayout}>
    <Svg width={screenWidth} height={screenHeight}
         viewBox={`0 0 ${screenWidth} ${screenHeight}`}>

      {Array.from({ length: lineCount }, (_, i) =>
        <G key={i} y={(i * AbcConfig.totalLineHeight + AbcConfig.topSpacing) * scale}>
          <Lines width={screenWidth} scale={scale} />
        </G>
      )}
    </Svg>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    height: "100%",
    width: "100%",
  }
});

export default Background;
