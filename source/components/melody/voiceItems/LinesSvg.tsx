import React, { memo } from "react";
import Svg, { G } from "react-native-svg";
import { AbcConfig } from "./config";
import Lines from "./Lines";

interface Props {
  scale: number;
}

const LinesSvg: React.FC<Props> = ({ scale }) => {
  return <Svg width={"100%"}
              height={AbcConfig.totalLineHeight * scale}>
    <G scale={scale} y={AbcConfig.topSpacing * scale}>
      <Lines />
    </G>
  </Svg>;
};

export default memo(LinesSvg);
