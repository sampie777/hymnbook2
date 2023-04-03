import React from "react";
import { Document } from "../../../../logic/db/models/Documents";
import { getPathForDocument } from "../../../../logic/documents/utils";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  document?: Document;
}

const DocumentsBreadcrumb: React.FC<Props> = ({ document }) => {
  if (!document) return null;

  const styles = createStyles(useTheme());
  const path = getPathForDocument(document);

  return <View style={styles.container}>
    <Text style={styles.text}>
      {path.map(it => it.name).join("  >  ")}
    </Text>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 20
  },
  text: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18
  }
});

export default DocumentsBreadcrumb;
