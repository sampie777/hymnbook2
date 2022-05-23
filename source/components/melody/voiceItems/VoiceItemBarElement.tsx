import React from "react";
import { AbcConfig } from "./config";
import Lines from "./Lines";
import Svg, { Color, G, Line } from "react-native-svg";
import { ThemeContextProps, useTheme } from "../../ThemeProvider";
import { StyleSheet, View } from "react-native";
import { VoiceItemBar } from "../../../scripts/songs/abc/abcjsTypes";

interface Props {
  item: VoiceItemBar;
  scale: number;
}

const VoiceItemBarElement: React.FC<Props> = ({ item, scale }) => {
  const styles = createStyles(useTheme());

  if (item.type === "bar_thin_thick") {
    const width = AbcConfig.lineBarThickWidth + AbcConfig.lineBarThinWidth;

    return <View style={[styles.container, styles.endBar, { minWidth: width * scale }]}>
      <Svg width={"100%"} height={AbcConfig.totalLineHeight * scale}>
        <G scale={scale} y={AbcConfig.topSpacing * scale}>
          <Lines />
        </G>
      </Svg>

      <Svg width={width}
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
  }

  if (item.type === "bar_thin") {
    const width = 2 * AbcConfig.notePadding;

    return <View style={[styles.container, { minWidth: width * scale }]}>
      <Svg width={"100%"} height={AbcConfig.totalLineHeight * scale}>
        <G scale={scale} y={AbcConfig.topSpacing * scale}>
          <Lines />
        </G>
      </Svg>

      <Svg width={AbcConfig.lineBarThinWidth}
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
  }

  return null;
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

export default VoiceItemBarElement;
