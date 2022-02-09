import React from "react";
import { Line } from "react-native-svg";
import { AbcConfig } from "./config";

interface Props {
  width?: number;
  scale?: number;
}

const Lines: React.FC<Props> = ({ width = 1000, scale = 1 }) => {
  return <>
    {[0, 1, 2, 3, 4].map(it =>
      <Line key={it}
            x1={0} y1={it * AbcConfig.lineSpacing * scale}
            x2={width} y2={it * AbcConfig.lineSpacing * scale}
            stroke="#333"
            strokeWidth={AbcConfig.lineWidth * scale} />
    )}
  </>;
};

export default Lines;
