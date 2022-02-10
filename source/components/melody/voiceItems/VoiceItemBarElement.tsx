import React, { useState } from "react";
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
  const [screenWidth, setScreenWidth] = useState(0);
  const styles = createStyles(useTheme());

  if (item.type === "bar_thin_thick") {
    const paddingRight = 11;
    const width = paddingRight + 5 + 6;

    return <View style={[styles.container, styles.endBar, { minWidth: width * scale }]}
                 onLayout={(e) => setScreenWidth(e.nativeEvent.layout.width)}>
      <Svg width={"100%"} height={AbcConfig.totalLineHeight * scale}
           viewBox={`0 0 ${screenWidth} ${AbcConfig.totalLineHeight * scale}`}>
        <G scale={scale} y={AbcConfig.topSpacing * scale}>
          <Lines />

          <G x={screenWidth / scale - paddingRight}>
            <Line x1={0} y1={0}
                  x2={0} y2={4 * AbcConfig.lineSpacing}
                  stroke={styles.bar.color as Color}
                  strokeWidth={1.5} />

            <Line x1={8} y1={0}
                  x2={8} y2={4 * AbcConfig.lineSpacing}
                  stroke={styles.bar.color as Color}
                  strokeWidth={8} />
          </G>
        </G>
      </Svg>
    </View>;
  }

  if (item.type === "bar_thin") {
    const width = 2 * AbcConfig.notePadding;

    return <View style={[styles.container, { minWidth: width * scale }]}
                 onLayout={(e) => setScreenWidth(e.nativeEvent.layout.width)}>
      <Svg width={"100%"} height={AbcConfig.totalLineHeight * scale}
           viewBox={`0 0 ${screenWidth} ${AbcConfig.totalLineHeight * scale}`}>
        <G scale={scale} y={AbcConfig.topSpacing * scale}>
          <Lines />

          <Line x1={width / 2} y1={0}
                x2={width / 2} y2={4 * AbcConfig.lineSpacing}
                stroke={styles.bar.color as Color}
                strokeWidth={1.5} />
        </G>
      </Svg>
    </View>;
  }

  return null;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
  },
  bar: {
    color: colors.notesColor,
  },
  endBar: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end"
  }
});

export default VoiceItemBarElement;
