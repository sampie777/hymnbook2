import React from "react";
import { StyleSheet, View } from "react-native";
import { AbcConfig } from "../config";
import Svg, { Color, G, Line } from "react-native-svg";
import Lines from "../Lines";
import { ThemeContextProps, useTheme } from "../../../ThemeProvider";

interface Props {
  scale: number;
}

const BarThinThick: React.FC<Props> = ({ scale }) => {
  const styles = createStyles(useTheme());
  const width = AbcConfig.lineBarThickWidth + AbcConfig.lineBarThinWidth;

  return <View style={[styles.container, styles.endBar, { minWidth: width * scale }]}>
    <Svg width={"100%"} height={AbcConfig.totalLineHeight * scale}>
      <G scale={scale} y={AbcConfig.topSpacing * scale}>
        <Lines />
      </G>
    </Svg>

    <Svg width={width * scale}
         height={AbcConfig.totalLineHeight * scale}
         style={{
           position: "absolute",
           alignSelf: "flex-end"
         }}>
      <G scale={scale} y={AbcConfig.topSpacing * scale}>
        <Line x1={0} y1={0}
              x2={0} y2={4 * AbcConfig.lineSpacing}
              stroke={styles.bar.color as Color}
              strokeWidth={AbcConfig.lineBarThinWidth} />

        <Line x1={AbcConfig.lineBarThickWidth} y1={0}
              x2={AbcConfig.lineBarThickWidth} y2={4 * AbcConfig.lineSpacing}
              stroke={styles.bar.color as Color}
              strokeWidth={AbcConfig.lineBarThickWidth} />
      </G>
    </Svg>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center"
  },
  bar: {
    color: colors.notesColor
  },
  endBar: {
    flex: 4,
    flexDirection: "row",
    justifyContent: "flex-end"
  }
});

export default BarThinThick;
