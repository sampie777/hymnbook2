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

  const data = "X:1\n" +
    "T: this is the title\n" +
    "K: A\n" +
    "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    // "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    // "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    // "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    // "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    // "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    // "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    // "w: ik ben_ ge-test of niet waar~ik dan ook end_\n" +
    // "C3 _D=E F3 c2 | z8 | F^G G5 A B | z1 z2 z3 z4 z8 | G8 |]\n" +
    "w: ik ben_ ge-test of niet waar~ik dan ook end_\n";

  return (
    <ScrollView style={styles.scrollContainer}>
      <MelodyView scale={scale} abc={data} />
      <MelodyView scale={scale} abc={data} />
      <MelodyView scale={scale} abc={data} />
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
