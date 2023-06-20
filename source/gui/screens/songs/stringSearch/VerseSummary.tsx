import React, { useCallback } from "react";
import { Verse } from "../../../../logic/db/models/Songs";
import { SongProcessor } from "../../../../logic/songs/songProcessor";
import { renderTextWithCustomReplacements } from "../../../components/utils";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, Text } from "react-native";

interface Props {
  verse: Verse;
  maxLines: number;
  preferredStartLine?: number;
  searchText?: string;
}

const VerseSummary: React.FC<Props> = ({ verse, maxLines, preferredStartLine = 0, searchText }) => {
  const styles = createStyles(useTheme());

  const lines = verse.content.split("\n");
  const startLine = preferredStartLine > lines.length - maxLines ? preferredStartLine - 1 : preferredStartLine;
  const viewableText = lines.slice(startLine, startLine + maxLines).join("\n");

  const displayName = SongProcessor.verseShortName(verse);

  const createHighlightedTextComponent = useCallback((text: string, index: number) =>
    <Text key={index} style={styles.textHighlighted}>
      {text}
    </Text>, []);

  return <Text style={styles.text}>
    {displayName.length === 0 ? undefined :
      <Text style={styles.verseNumber}>{displayName}  </Text>
    }

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

export default VerseSummary;
