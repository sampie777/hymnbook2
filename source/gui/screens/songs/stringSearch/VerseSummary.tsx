import React from "react";
import { Verse } from "../../../../logic/db/models/Songs";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, Text } from "react-native";

interface Props {
  verse: Verse;
  maxLines: number;
}

const VerseSummary: React.FC<Props> = ({ verse, maxLines }) => {
  const styles = createStyles(useTheme());

  const lines = verse.content.split("\n").slice(0, maxLines);

  return <>
    {lines.map((it, index) =>
      <Text key={index + it} style={styles.text}>{it}</Text>)}
  </>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  text: {
    color: colors.text,
  }
});

export default VerseSummary;
