import React, { ReactNode, useMemo } from "react";
import Settings from "../../../settings";
import { ThemeContextProps, useTheme } from "../ThemeProvider";
import { Platform, StyleSheet, View } from "react-native";
import HTMLView, { HTMLViewNode, HTMLViewNodeRenderer } from "react-native-htmlview";

interface Props {
  html: string;
  onLayout?: () => void;
}

/**
 * The original used HTML viewer for documents. As this HTML viewer doesn't support animations, and thus doesn't
 * support zoom, a new AnimatedHtmlView component was created. However, changes during implementation showed that
 * this original HTML viewer can somehow support animations by setting custom Components, like so:
 * ```
 *    <HTMLView TextComponent={Animated.Text} NodeComponent={Animated.Text} />
 * ```
 * But this behaviour is unstable (see how a <ol> reacts when zooming out: the margin will jump, although animated).
 * The self developed AnimatedHtmlView component does support animations fully, but its disadvantage is that it
 * is not fully tested for all HTML strings. So some HTMl might be unsupported. (Although its lists are more
 * beautiful than the original HTML viewer).
 */
const OriginalHtmlViewer: React.FC<Props> = ({ html, onLayout }) => {
  const theme = useTheme();
  const htmlStyles = useMemo(() => createHtmlStyles(theme), [theme]);

  const renderNode = (
    node: HTMLViewNode,
    index: number,
    siblings: HTMLViewNode[],
    parent: HTMLViewNode,
    defaultRenderer: HTMLViewNodeRenderer): ReactNode | undefined => {
    if (node.name === "sup") {
      // Disable auto removing empty views (collapsable=false),
      // as it causes https://trello.com/c/lgysuHsN/79-bug-some-document-transitions-let-the-app-crash
      return <View key={index}
                   collapsable={false}>
        {defaultRenderer(node.children, node)}
      </View>;
    } else if (node.name === "span") {
      return defaultRenderer(node.children, node);
    }
    return undefined;
  };

  return <View key={html.length} onLayout={onLayout}>
    <HTMLView value={html.replace(/\n/gi, "")}
              paragraphBreak={""}
              renderNode={renderNode}
              textComponentProps={{ selectable: Settings.enableTextSelection }}
              stylesheet={htmlStyles} />
  </View>;
};


const createHtmlStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  p: {
    color: colors.text.default,
    fontSize: 20 * Settings.songScale,
    lineHeight: 30 * Settings.songScale
  },
  h1: {
    color: colors.text.default,
    fontSize: 38 * Settings.songScale,
    lineHeight: 50 * Settings.songScale,
    paddingTop: 10 * Settings.songScale,
    marginBottom: -30 * Settings.songScale,
    fontWeight: "bold"
  },
  h2: {
    color: colors.text.default,
    fontSize: 32 * Settings.songScale,
    lineHeight: 50 * Settings.songScale,
    paddingTop: 20 * Settings.songScale,
    marginBottom: -30 * Settings.songScale,
    fontWeight: "bold"
  },
  h3: {
    color: colors.text.default,
    fontSize: 26 * Settings.songScale,
    lineHeight: 45 * Settings.songScale,
    paddingTop: 20 * Settings.songScale,
    marginBottom: -25 * Settings.songScale,
    fontWeight: "bold"
  },
  h4: {
    color: colors.text.default,
    fontSize: 20 * Settings.songScale,
    lineHeight: 40 * Settings.songScale,
    paddingTop: 15 * Settings.songScale,
    marginBottom: -18 * Settings.songScale,
    fontWeight: "bold"
  },
  h5: {
    color: colors.text.default,
    fontSize: 18 * Settings.songScale,
    lineHeight: 35 * Settings.songScale,
    paddingTop: 15 * Settings.songScale,
    marginBottom: -20 * Settings.songScale,
    fontWeight: "bold"
  },
  h6: {
    color: colors.text.default,
    fontSize: 12 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    paddingTop: 10 * Settings.songScale,
    fontWeight: "bold"
  },
  ul: {
    color: colors.text.default,
    fontSize: 20 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    marginVertical: 10 * Settings.songScale
  },
  ol: {
    color: colors.text.default,
    fontSize: 20 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    marginVertical: 10 * Settings.songScale
  },
  pre: {
    color: colors.text.default,
    fontSize: 19 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace"
  },

  blockquote: {
    color: colors.text.default,
    fontSize: 20 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    borderLeftWidth: 5,
    borderLeftColor: colors.border.variant,
    paddingLeft: 30,
    paddingVertical: 15 * Settings.songScale,
    marginVertical: 15 * Settings.songScale
  },
  code: {
    fontSize: 19 * Settings.songScale,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace"
  },
  ins: {
    textDecorationLine: "underline"
  },
  del: {
    textDecorationLine: "line-through"
  },
  sup: {
    fontSize: 13 * Settings.songScale
  },
  sub: {
    fontSize: 13 * Settings.songScale
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#555"
  }
});

export default OriginalHtmlViewer;
