import React from "react";
import { Animated, StyleSheet } from "react-native";
import { AbcConfig } from "../../config";
import { Line } from "react-native-svg";
import { ThemeContextProps, useTheme } from "../../../providers/ThemeProvider";
import LinesSvg from "../../other/LinesSvg";
import { AnimatedG, AnimatedSvg } from "../../../utils";

interface Props {
  animatedScale: Animated.Value;
}

const BarThin: React.FC<Props> = ({ animatedScale }) => {
  const styles = createStyles(useTheme());
  const width = 2 * AbcConfig.notePadding;

  const animatedStyles = {
    container: {
      minWidth: Animated.multiply(animatedScale, width)
    },
    svg: {
      width: Animated.multiply(animatedScale, width),
      height: Animated.multiply(animatedScale, AbcConfig.totalLineHeight)
    }
  };

  return <Animated.View style={[styles.container, animatedStyles.container]}>
    <LinesSvg animatedScale={animatedScale} />

    <AnimatedSvg width={animatedStyles.svg.width} height={animatedStyles.svg.height}>
      <AnimatedG scale={animatedScale} y={Animated.multiply(animatedScale, AbcConfig.topSpacing)}>
        <Line x1={AbcConfig.lineBarThinWidth / 2} y1={0}
              x2={AbcConfig.lineBarThinWidth / 2} y2={4 * AbcConfig.lineSpacing}
              stroke={styles.bar.color}
              strokeWidth={AbcConfig.lineBarThinWidth} />
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
    color: colors.notes.color
  }
});

export default BarThin;
