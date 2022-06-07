import React, { memo } from "react";
import { Animated } from "react-native";
import { AbcConfig } from "../config";
import Lines from "./Lines";
import { AnimatedG, AnimatedSvg } from "../../utils";

interface Props {
  animatedScale: Animated.Value;
}

const LinesSvg: React.FC<Props> = ({ animatedScale }) => {
  return <AnimatedSvg width={"100%"}
                      style={{ position: "absolute" }}
                      height={Animated.multiply(animatedScale, AbcConfig.totalLineHeight)}>
    <AnimatedG scale={animatedScale} y={Animated.multiply(animatedScale, AbcConfig.topSpacing)}>
      <Lines />
    </AnimatedG>
  </AnimatedSvg>;
};

export default memo(LinesSvg);
