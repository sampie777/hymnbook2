import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Onboarding from 'react-native-onboarding-swiper';
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { displayName } from "../../../../app.json";
import SongSearchTutorial from "./SongSearchTutorial";
import { DatabasesRoute, ParamList } from "../../../navigation";
import { Types } from "../downloads/TypeSelectBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Tutorial } from "../../../logic/tutorial";

interface Props {
  navigation: NativeStackNavigationProp<ParamList>;
}

const TutorialScreen: React.FC<Props> = ({navigation}) => {
  const styles = createStyles(useTheme());

  const finishTutorial = () => {
    Tutorial.complete();
    navigation.replace(DatabasesRoute, { type: Types.Songs });
  }

  return <View style={styles.container}>
    <Onboarding
      onDone={finishTutorial}
      onSkip={finishTutorial}
      bottomBarHighlight={false}
      controlStatusBar={false}
      showDone={false}
      titleStyles={{fontSize: 30, color: useTheme().colors.text.header}}
      subTitleStyles={styles.text}
      pages={[
        {
          backgroundColor: styles.titlePage.backgroundColor.toString(),
          image: <Text style={styles.titleContent} numberOfLines={1} adjustsFontSizeToFit={true}>{displayName}</Text>,
          title: '',
          subtitle: "Let's quickly go through the basics!",
        },
        {
          backgroundColor: styles.page.backgroundColor.toString(),
          image: <SongSearchTutorial />,
          title: 'Songs',
          subtitle: 'There are different ways to interact with a song:\n' +
            '- Tap on the song name\n' +
            '- Tap on the + button\n' +
            '- Long press either\n' +
            '\n' +
            'Try it on the buttons above!',
        },
        {
          backgroundColor: styles.titlePage.backgroundColor.toString(),
          image: <View style={styles.goToDownloadsPage}>
            <Text style={styles.text}>To start using the app, you should first download the song bundles you want to use.</Text>
            <Text style={styles.text}>Tap the button to start:</Text>

            <TouchableOpacity onPress={finishTutorial} style={styles.button}>
              <Text style={styles.downloadText}
                    importantForAccessibility={"auto"}>
                Let's get started! </Text>
            </TouchableOpacity>
          </View>,
          title: '',
          subtitle: "",
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
  text: {
    fontSize: 20,
    textAlign: "center",
    color: colors.text.default
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
    paddingHorizontal: 20,
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
