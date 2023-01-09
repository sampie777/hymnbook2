import React from "react";
import { Animated, StyleSheet } from "react-native";
import { AbcConfig } from "../../config";
import { Line } from "react-native-svg";
import { ThemeContextProps, useTheme } from "../../../ThemeProvider";
import LinesSvg from "../../other/LinesSvg";
import { AnimatedG, AnimatedSvg } from "../../../utils";

interface Props {
  animatedScale: Animated.Value;
}

const BarThinThick: React.FC<Props> = ({ animatedScale }) => {
  const styles = createStyles(useTheme());
  const width = AbcConfig.lineBarThickWidth + AbcConfig.lineBarThinWidth;

  const animatedStyles = {
    container: {
      minWidth: Animated.multiply(animatedScale, width)
    },
    svg: {
      width: Animated.multiply(animatedScale, width),
      height: Animated.multiply(animatedScale, AbcConfig.totalLineHeight)
    }
  };

  return <Animated.View style={[styles.container, animatedStyles.container, styles.endBar]}>
    <LinesSvg animatedScale={animatedScale} />

    <AnimatedSvg width={animatedStyles.svg.width} height={animatedStyles.svg.height}>
      <AnimatedG scale={animatedScale} y={Animated.multiply(animatedScale, AbcConfig.topSpacing)}>
        <Line x1={0} y1={0}
              x2={0} y2={4 * AbcConfig.lineSpacing}
              stroke={styles.bar.color}
              strokeWidth={AbcConfig.lineBarThinWidth} />

        <Line x1={AbcConfig.lineBarThickWidth} y1={0}
              x2={AbcConfig.lineBarThickWidth} y2={4 * AbcConfig.lineSpacing}
              stroke={styles.bar.color}
              strokeWidth={AbcConfig.lineBarThickWidth} />
      </AnimatedG>
    </AnimatedSvg>
  </Animated.View>;
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
