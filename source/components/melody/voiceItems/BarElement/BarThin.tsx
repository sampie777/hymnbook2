import React from "react";
import { StyleSheet, View } from "react-native";
import { AbcConfig } from "../config";
import Svg, { Color, G, Line } from "react-native-svg";
import Lines from "../Lines";
import { ThemeContextProps, useTheme } from "../../../ThemeProvider";

interface Props {
  scale: number;
}

const BarThin: React.FC<Props> = ({ scale }) => {
  const styles = createStyles(useTheme());
  const width = 2 * AbcConfig.notePadding;

  return <View style={[styles.container, { minWidth: width * scale }]}>
    <Svg width={"100%"} height={AbcConfig.totalLineHeight * scale}>
      <G scale={scale} y={AbcConfig.topSpacing * scale}>
        <Lines />
      </G>
    </Svg>

    <Svg width={AbcConfig.lineBarThinWidth * scale}
         height={AbcConfig.totalLineHeight * scale}
         style={{ position: "absolute" }}>
      <G scale={scale} y={AbcConfig.topSpacing * scale}>
        <Line x1={AbcConfig.lineBarThinWidth / 2} y1={0}
              x2={AbcConfig.lineBarThinWidth / 2} y2={4 * AbcConfig.lineSpacing}
              stroke={styles.bar.color as Color}
              strokeWidth={AbcConfig.lineBarThinWidth} />
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

export default BarThin;
