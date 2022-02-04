import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemeContextProps, useTheme } from "../ThemeProvider";
import { ABC } from "../../scripts/songs/abc/abc";
import VoiceItemElement from "./voiceItems/VoiceItemElement";
import VoiceItemIntroElement from "./voiceItems/VoiceItemIntroElement";

interface ComponentProps {
}

const MelodyTest2: React.FC<ComponentProps>
  = ({}) => {
  const styles = createStyles(useTheme());
  const scale = 1;

  const data = "X:1\n" +
    "T: this is the title\n" +
    "C2 _D=E F2 c2 | F^G G4 A B | G8|]\n" +
    "w: ik ben_ ge-test of niet waar~ik dan ook end_";

  const song = ABC.parse(data);

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <VoiceItemIntroElement scale={scale} />
        {song?.melody.map((it, index) =>
          <VoiceItemElement key={index} item={it} verticalSpacing={scale} />)}
      </View>
    </ScrollView>
  );
};

export default MelodyTest2;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  scrollContainer: {
    flex: 1
  },
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start"
  }
});
