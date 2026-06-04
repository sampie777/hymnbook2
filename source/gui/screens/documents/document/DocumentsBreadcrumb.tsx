import React from "react";
import Settings from "../../../../settings";
import { Document } from "../../../../logic/db/models/documents/Documents";
import { getPathForDocumentOrDocumentGroup } from "../../../../logic/documents/utils";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { StyleSheet } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { AnimatedSafeText } from "../../../components/SafeText.tsx";

interface Props {
  document?: Document;
  scale: SharedValue<number>;
}

const DocumentsBreadcrumb: React.FC<Props> = ({ document, scale }) => {
  if (!document) return null;

  const styles = createStyles(useTheme());
  const animatedStyles = {
    container: useAnimatedStyle(() => ({
      marginBottom: scale.value * 20
    })),
    text: useAnimatedStyle(() => ({
      fontSize: scale.value * 13,
      lineHeight: scale.value * 18
    }))
  };
  const path = getPathForDocumentOrDocumentGroup(document);

  return <Animated.View style={[styles.container, animatedStyles.container]}>
    <AnimatedSafeText style={[styles.text, animatedStyles.text]}
                   selectable={Settings.enableTextSelection}>
      {path.map(it => it.name).join("  >  ")}
    </AnimatedSafeText>
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
