import React, { memo } from "react";
import { AbcConfig } from "../config";
import { Line } from "react-native-svg";
import { ThemeContextProps, useTheme } from "../../ThemeProvider";

interface Props {
  width?: number;
  scale?: number;
}

const Lines: React.FC<Props> = ({ width = 1000, scale = 1 }) => {
  const styles = createStyles(useTheme());
  return <>
    {[0, 1, 2, 3, 4].map(it =>
      <Line key={it}
            x1={0} y1={it * AbcConfig.lineSpacing * scale}
            x2={width} y2={it * AbcConfig.lineSpacing * scale}
            stroke={styles.color}
            strokeWidth={AbcConfig.lineWidth * scale} />
    )}
  </>;
};

const createStyles = ({ colors }: ThemeContextProps) => ({
  color: colors.notes.lines
});

export default memo(Lines);
