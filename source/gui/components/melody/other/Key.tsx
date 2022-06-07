import React from "react";
import { Animated } from "react-native";
import { AbcConfig } from "../config";
import { KeySignature } from "../../../../logic/songs/abc/abcjsTypes";
import { Color, Text } from "react-native-svg";
import { ThemeContextProps, useTheme } from "../../ThemeProvider";
import Lines from "./Lines";
import { AnimatedG, AnimatedSvg } from "../../utils";

interface Props {
  animatedScale: Animated.Value;
  keySignature: KeySignature;
}

const Key: React.FC<Props> = ({ animatedScale, keySignature }) => {
  if (keySignature.accidentals === undefined || keySignature.accidentals.length === 0) {
    return null;
  }

  const styles = createStyles(useTheme());
  const charWidth = 10;
  const width = keySignature.accidentals.length * charWidth + charWidth / 2;

  const animatedStyles = {
    container: {
      minWidth: Animated.multiply(animatedScale, width)
    },
    svg: {
      width: "100%",
      height: Animated.multiply(animatedScale, AbcConfig.totalLineHeight)
    }
  };

  let xOffset = 0;
  return <Animated.View style={[styles.container, animatedStyles.container]}>
    <AnimatedSvg width={animatedStyles.svg.width} height={animatedStyles.svg.height}>
      <AnimatedG scale={animatedScale} y={Animated.multiply(animatedScale, AbcConfig.topSpacing)}>
        <Lines />

        {keySignature.accidentals.map(it => {
          const y = 4 + (10 - it.verticalPos) * (AbcConfig.lineSpacing / 2);

          if (it.acc === "sharp") {
            return <Text fontSize={22}
                         key={it.note + it.verticalPos}
                         x={charWidth * (xOffset++)} y={y}
                         fill={styles.color}
                         textAnchor={"start"}>♯</Text>;
          }
          if (it.acc === "flat") {
            return <Text fontSize={34}
                         key={it.note + it.verticalPos}
                         x={charWidth * (xOffset++)} y={y}
                         fill={styles.color}
                         textAnchor={"start"}>♭</Text>;
          }
          return undefined;
        })}
      </AnimatedG>
    </AnimatedSvg>
  </Animated.View>;
};

const createStyles = ({ colors }: ThemeContextProps) => ({
  container: {},
  color: colors.notesColor as Color
});

export default Key;
