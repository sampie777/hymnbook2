import React, { useCallback } from "react";
import { Verse } from "../../../../logic/db/models/Songs";
import { renderTextWithCustomReplacements } from "../../../components/utils";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, Text } from "react-native";

interface Props {
  verse: Verse;
  maxLines: number;
  searchText?: string;
}

const VerseSummary: React.FC<Props> = ({ verse, maxLines, searchText }) => {
  const styles = createStyles(useTheme());

  const lines = verse.content.split("\n").slice(0, maxLines).join("\n");

  const createHighlightedTextComponent = useCallback((text: string, index: number) =>
    <Text key={index} style={styles.textHighlighted}>
      {text}
    </Text>, []);

  return <Text style={styles.text}>
    {searchText === undefined ? lines :
      renderTextWithCustomReplacements(lines, searchText, createHighlightedTextComponent)
    }
  </Text>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  text: {
    color: colors.text
  },

  textHighlighted: {
    color: colors.textHighlightedForeground,
    backgroundColor: colors.textHighlightedBackground
  }
});

export default VerseSummary;
