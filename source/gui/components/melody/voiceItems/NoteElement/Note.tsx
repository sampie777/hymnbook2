import React, { memo } from "react";
import { AbcConfig } from "../../config";
import { AbcPitch, StemDirection } from "../../../../../logic/songs/abc/abcjsTypes";
import { Circle, Color, Ellipse, G, Line, Path, Text } from "react-native-svg";
import { ThemeContextProps, useTheme } from "../../../ThemeProvider";

interface Props {
  pitch: AbcPitch,
  duration: number,
}

const Note: React.FC<Props> = ({ pitch, duration }) => {
  const styles = createStyles(useTheme());
  const y = (10 - pitch.pitch) * (AbcConfig.lineSpacing / 2);
  const width = AbcConfig.noteWidth;

  const fill = duration < 0.5;
  let stem: StemDirection = "none";
  if (duration < 1) {
    if (pitch.pitch < 6) {
      stem = "up";
    } else {
      stem = "down";
    }
  }

  const extraLines = [];
  for (let i = 0; i >= pitch.pitch; i--) {
    if ((pitch.pitch - i) % 2 === 0) {
      extraLines.push(i / 2);
    }
  }
  for (let i = 0; i <= pitch.pitch - 12; i++) {
    if ((pitch.pitch - i) % 2 === 0) {
      extraLines.push(i / 2);
    }
  }

  const stemX = stem === "up"
    ? AbcConfig.stemWidth + width * 0.6
    : AbcConfig.stemWidth - width * 1.4;

  return <G y={y}>
    {stem !== "up" ? undefined :
      <Line x1={stemX} y1={-1.5}
            x2={stemX} y2={-1 * AbcConfig.stemHeight}
            stroke={styles.color}
            strokeWidth={AbcConfig.stemWidth} />}
    {stem !== "down" ? undefined :
      <Line x1={stemX} y1={2.5}
            x2={stemX} y2={AbcConfig.stemHeight}
            stroke={styles.color}
            strokeWidth={AbcConfig.stemWidth} />}

    {duration !== 0.125 ? undefined :
      <G x={stemX} y={(stem === "up" ? -1 : 1) * AbcConfig.stemHeight}
         transform={stem === "up" ? undefined : "scale(1, -1)"}>
        <Path
          d={"M0 0 C 1 8 8 13 6 20 S 8 12 0 10 z"}
          fill={styles.color}
          fillRule={"evenodd"}
          stroke={styles.color}
          strokeWidth={0.7} />
      </G>}

    {extraLines.map(it =>
      <Line key={it}
            x1={-1 * width - 5} y1={it * AbcConfig.lineSpacing}
            x2={width + 5} y2={it * AbcConfig.lineSpacing}
            stroke={styles.color}
            strokeWidth={AbcConfig.lineWidth} />)}

    <Ellipse rotation={duration === 1 ? 0 : -30}
             rx={width}
             ry={duration === 1 ? 1.3 * AbcConfig.noteHeight : AbcConfig.noteHeight}
             strokeWidth={2.5}
             stroke={styles.color}
             fill={fill ? styles.color : "none"} />

    {duration !== 1 ? undefined :
      <Ellipse rotation={duration === 1 ? 0 : -30}
               rx={width + 2.3}
               ry={duration === 1 ? 1.3 * AbcConfig.noteHeight : AbcConfig.noteHeight}
               strokeWidth={2.0}
               stroke={styles.color}
               fill={"none"} />}


    {!(duration === 0.375 || duration === 0.625) ? undefined :
      <Circle cx={width + 6.5}
              cy={pitch.pitch % 2 === 0 ? -1 * (AbcConfig.lineSpacing / 2) : 0}
              r={2}
              fill={styles.color} />
    }

    {pitch.accidental !== "sharp" ? undefined :
      <Text fontSize={22}
            x={-7} y={6}
            fill={styles.color}
            textAnchor={"end"}>♯</Text>}

    {pitch.accidental !== "flat" ? undefined :
      <Text fontSize={34}
            x={-7} y={4}
            fill={styles.color}
            textAnchor={"end"}>♭</Text>}

    {pitch.accidental !== "natural" ? undefined :
      <Text fontSize={28}
            x={-7} y={4}
            fill={styles.color}
            textAnchor={"end"}>♮</Text>}
  </G>;
};

const createStyles = ({ colors }: ThemeContextProps) => ({
  color: colors.notesColor as Color
});

const propsAreEqual = (prevProps: Props, nextProps: Props): boolean =>
  prevProps.pitch.pitch === nextProps.pitch.pitch &&
  prevProps.pitch.accidental === nextProps.pitch.accidental &&
  prevProps.duration === nextProps.duration;

export default memo(Note, propsAreEqual);
