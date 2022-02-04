import React from "react";
import { Line } from "react-native-svg";
import { AbcConfig } from "./config";

interface Props {
}

const Lines: React.FC<Props> = () => {
  return <>
    {[0, 1, 2, 3, 4].map(it =>
      <Line key={it}
            x1="0" y1={it * AbcConfig.lineSpacing}
            x2="1000" y2={it * AbcConfig.lineSpacing}
            stroke="#333"
            strokeWidth={AbcConfig.lineWidth} />
    )}
  </>;
};

export default Lines;
