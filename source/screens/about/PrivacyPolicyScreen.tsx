import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import UrlLink from "../../components/UrlLink";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";


const PrivacyPolicyScreen: React.FC = () => {
  const styles = createStyles(useTheme());
  return (<ScrollView style={styles.container}>
    <View style={styles.content}>
      <Text style={[styles.contentText]}>
        INTRODUCTION. Privacy is important, and we value it. That's why we want you to know what you can expect
        regarding your privacy while using this app. In short: we won't know who you are and what we know (which is very
        little), we will keep to ourselves.
      </Text>
      <Text style={[styles.contentText]}>
        BACKEND. This app or it's backend doesn't collect any personal information from you. The authentication with the
        backend
        uses a (mostly) unique device ID, which is generated by your device. This device ID is used to maintain the same
        authentication for each device after app re-installs. That way the authorization for each device can made be
        persistent. The use of the device ID eliminates the use of user accounts.
      </Text>

      <Text style={[styles.contentText]}>
        The backend may store your IP. However, your IP is stored on every server you connect with through any app you
        use,
        so this isn't much news.
      </Text>

      <Text style={styles.contentText}>
        The backend used for this app, is jSchedule. jSchedule is an online platform for managing church service
        schedules/liturgies. This provides us with a extensive and growing database of all kind of Christian songs.
      </Text>

      <UrlLink url={"https://jschedule.sajansen.nl"} workWithEmulator={false}>
        <Text style={[styles.contentText, styles.webpageLink]}>Visit jSchedule.</Text>
      </UrlLink>

      <Text style={[styles.contentText]}>
        SURVEYS.
        The surveys are created using Google Forms. Please refer to Google's privacy policy when you use these surveys.
        Note that we don't collect your e-mail information, but Google may use it for their purposes.
      </Text>
    </View>
  </ScrollView>);
};

export default PrivacyPolicyScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  content: {
    paddingTop: 50,
    paddingBottom: 200
  },
  contentText: {
    fontFamily: "sans-serif-light",
    lineHeight: 25,
    marginBottom: 30,
    paddingHorizontal: 30,
    color: colors.text,
  },
  webpageLink: {
    textAlign: "center",
    color: colors.url
  }
});
