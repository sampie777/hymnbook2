import React, { useCallback } from "react";
import { renderTextWithCustomReplacements } from "../../../../components/utils";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider";
import { StyleSheet, Text } from "react-native";
import { Document } from "../../../../../logic/db/models/documents/Documents.ts";

interface Props {
  document: Document;
  maxLines: number;
  preferredStartLine?: number;
  searchText?: string;
}

const DocumentSummary: React.FC<Props> = ({ document, maxLines, preferredStartLine = 0, searchText }) => {
  const styles = createStyles(useTheme());

  const lines = document.html.split("\n");
  const startLine = preferredStartLine > lines.length - maxLines ? preferredStartLine - 1 : preferredStartLine;
  const viewableText = lines.slice(startLine, startLine + maxLines).join("\n");

  const createHighlightedTextComponent = useCallback((text: string, index: number) =>
    <Text key={index} style={styles.textHighlighted}>
      {text}
    </Text>, []);

  return <Text style={styles.text}
               textBreakStrategy={"balanced"}
               importantForAccessibility={"auto"}>
    {startLine > 0 ? "... " : null}
    {searchText === undefined ? viewableText :
      renderTextWithCustomReplacements(viewableText, searchText, createHighlightedTextComponent)
    }
    {startLine + maxLines < lines.length ? " ..." : null}
  </Text>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  verseNumber: {
    color: colors.text.lighter,
    fontSize: 12,
    fontStyle: "italic"
  },
  text: {
    color: colors.text.default,
    paddingBottom: 2
  },

  textHighlighted: {
    color: colors.text.highlighted.foreground,
    backgroundColor: colors.text.highlighted.background
  }
});

export default DocumentSummary;
