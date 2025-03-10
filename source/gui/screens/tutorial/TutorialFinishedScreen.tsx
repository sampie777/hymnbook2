import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";

interface Props {
  onFinish: () => void,
  subTitleStyles?: StyleProp<TextStyle> | undefined,
  bundlesCount: number
}

const TutorialFinishedScreen: React.FC<Props> = ({ onFinish, subTitleStyles, bundlesCount }) => {
  const styles = createStyles(useTheme());

  return <View style={styles.container}>
    <Text style={[subTitleStyles, styles.textOnPrimary]}>
      To start using the app, you should first download the song bundles you want to use.
    </Text>
    {bundlesCount == 0 ? null :
      <Text style={[subTitleStyles, styles.textOnPrimary]}>
        It appears you've already done this, great!
      </Text>
    }
    <Text style={[subTitleStyles, styles.textOnPrimary]}>Tap the button to start:</Text>

    <TouchableOpacity onPress={onFinish} style={styles.button}>
      <Text style={styles.downloadText}
            importantForAccessibility={"auto"}>
        Let's get started!</Text>
    </TouchableOpacity>
  </View>
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 20,
  },
  textOnPrimary: {
    color: colors.onPrimary,
  },

  button: {
    marginTop: 20,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.onPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadText: {
    fontSize: 26,
    color: colors.primary.default,
    textAlign: "center"
  }
});

export default TutorialFinishedScreen;
