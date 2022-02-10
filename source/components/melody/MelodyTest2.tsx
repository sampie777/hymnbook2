import React from "react";
import { ThemeContextProps, useTheme } from "../ThemeProvider";
import { ScrollView, StyleSheet } from "react-native";
import MelodyView from "./MelodyView";

interface ComponentProps {
}

const MelodyTest2: React.FC<ComponentProps>
  = ({}) => {
  const styles = createStyles(useTheme());
  const scale = 1;

  return (
    <ScrollView style={styles.scrollContainer}>
      <MelodyView scale={scale} />
      <MelodyView scale={scale} />
      <MelodyView scale={scale} />
    </ScrollView>
  );
};

export default MelodyTest2;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  }
});
