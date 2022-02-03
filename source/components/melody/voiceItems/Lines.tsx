import React from "react";
import { Line } from "react-native-svg";

interface Props {
  verticalSpacing: number;
}

const Lines: React.FC<Props> = ({ verticalSpacing }) => {
  return <>
    {[0, 1, 2, 3, 4].map(it =>
      <Line key={it}
            x1="0" y1={it * verticalSpacing}
            x2="100" y2={it * verticalSpacing}
            stroke="#333"
            strokeWidth={1} />
    )}
  </>;
};

export default Lines;
