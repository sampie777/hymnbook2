import React from "react";
import Settings from "../../../../settings";
import { Document } from "../../../../logic/db/models/documents/Documents";
import { getPathForDocument } from "../../../../logic/documents/utils";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { Animated, StyleSheet } from "react-native";

interface Props {
  document?: Document;
  scale: Animated.Value;
}

const DocumentsBreadcrumb: React.FC<Props> = ({ document, scale }) => {
  if (!document) return null;

  const styles = createStyles(useTheme());
  const animatedStyles = {
    container: {
      marginBottom: Animated.multiply(scale, 20)
    },
    text: {
      fontSize: Animated.multiply(scale, 13),
      lineHeight: Animated.multiply(scale, 18)
    }
  };
  const path = getPathForDocument(document);

  return <Animated.View style={[styles.container, animatedStyles.container]}>
    <Animated.Text style={[styles.text, animatedStyles.text]}
                   selectable={Settings.enableTextSelection}>
      {path.map(it => it.name).join("  >  ")}
    </Animated.Text>
  </Animated.View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  text: {
    color: colors.text.light
  }
});

export default DocumentsBreadcrumb;
