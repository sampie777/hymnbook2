import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Onboarding from 'react-native-onboarding-swiper';
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { displayName } from "../../../../app.json";
import { songSearchTutorialPage } from "./songsearch/SongSearchTutorial";
import { DatabasesRoute, HomeRoute, ParamList } from "../../../navigation";
import { Types } from "../downloads/TypeSelectBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Tutorial } from "../../../logic/tutorial";
import TutorialFinishedScreen from "./TutorialFinishedScreen";
import { useSongBundleCount } from "../../components/utils";

interface Props {
  navigation: NativeStackNavigationProp<ParamList>;
}

const TutorialScreen: React.FC<Props> = ({ navigation }) => {
  const bundlesCount = useSongBundleCount();
  const styles = createStyles(useTheme());

  const finishTutorial = () => {
    Tutorial.complete();
    navigation.replace(HomeRoute);

    if (bundlesCount() > 0) return;
    navigation.navigate(DatabasesRoute, { type: Types.Songs });
  }

  return <View style={styles.container}>
    <Onboarding
      onDone={finishTutorial}
      onSkip={finishTutorial}
      bottomBarHighlight={false}
      controlStatusBar={false}
      showDone={false}
      titleStyles={styles.title}
      subTitleStyles={styles.text}
      pages={[
        {
          backgroundColor: styles.titlePage.backgroundColor.toString(),
          image: <Text style={styles.titleContent} numberOfLines={1} adjustsFontSizeToFit={true}>{displayName}</Text>,
          title: '',
          subtitle: <Text style={[styles.text, styles.textOnPrimary]}>Let's quickly go through the basics!</Text>,
        },
        songSearchTutorialPage({
          backgroundColor: styles.page.backgroundColor.toString(),
          subTitleStyles: styles.text,
        }),
        {
          backgroundColor: styles.titlePage.backgroundColor.toString(),
          image: <TutorialFinishedScreen onFinish={finishTutorial}
                                         subTitleStyles={styles.text}
                                         bundlesCount={bundlesCount()} />,
          title: '',
          subtitle: '',
        },
      ]} />
  </View>;
};


const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    color: colors.text.header,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    color: colors.text.default,
    paddingHorizontal: 10,
  },
  textOnPrimary: {
    color: colors.onPrimary,
  },

  titlePage: {
    backgroundColor: colors.primary.default,
  },
  titleContent: {
    color: colors.onPrimary,
    fontSize: 60,
    paddingHorizontal: 20,
    fontFamily: fontFamily.sansSerifLight,
    bottom: 20,
    textAlign: "center",
  },

  goToDownloadsPage: {
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 20,
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

export default TutorialScreen;
