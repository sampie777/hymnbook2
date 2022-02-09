import React, { useState } from "react";
import { AbcConfig } from "../voiceItems/config";
import { KeySignature } from "../../../scripts/songs/abc/abcjsTypes";
import { StyleSheet, View } from "react-native";
import Svg, { G, Text } from "react-native-svg";
import Lines from "../voiceItems/Lines";

interface Props {
  scale: number;
  keySignature: KeySignature;
}

const Key: React.FC<Props> = ({ scale, keySignature }) => {
  if (keySignature.accidentals === undefined || keySignature.accidentals.length === 0) {
    return null;
  }

  const [screenWidth, setScreenWidth] = useState(0);
  const charWidth = 10;
  const width = keySignature.accidentals.length * charWidth + charWidth / 2;

  let xOffset = 0;
  return <View style={[styles.container, { minWidth: width * scale }]}
               onLayout={(e) => setScreenWidth(e.nativeEvent.layout.width)}>
    <Svg width={"100%"} height={AbcConfig.totalLineHeight * scale}
         viewBox={`0 0 ${screenWidth} ${AbcConfig.totalLineHeight * scale}`}>
      <G scale={scale} y={AbcConfig.topSpacing * scale}>
        <Lines />

        {keySignature.accidentals.map(it => {
          const y = 4 + (10 - it.verticalPos) * (AbcConfig.lineSpacing / 2);

          if (it.acc === "sharp") {
            return <Text fontSize={22}
                         key={it.note + it.verticalPos}
                         x={charWidth * (xOffset++)} y={y}
                         fill={"#000"}
                         textAnchor={"start"}>♯</Text>;
          }
          if (it.acc === "flat") {
            return <Text fontSize={34}
                         key={it.note + it.verticalPos}
                         x={charWidth * (xOffset++)} y={y}
                         fill={"#000"}
                         textAnchor={"start"}>♭</Text>;
          }
          return undefined;
        })}
      </G>
    </Svg>
  </View>;
};

const styles = StyleSheet.create({
  container: {}
});

export default Key;
