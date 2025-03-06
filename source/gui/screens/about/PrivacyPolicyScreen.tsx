import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";


const PrivacyPolicyScreen: React.FC = () => {
  const styles = createStyles(useTheme());
  return (<ScrollView style={styles.container}>
    <View style={styles.content}>
      <Text style={[styles.contentText]}>
        Last updated: 19/9/2023.
      </Text>
      <Text style={[styles.contentText]}>
        INTRODUCTION. Privacy is important, and we value it. That's why we want you to know what you can expect
        regarding your privacy while using this app. In short: we won't know who you are and what we know (which is very
        little), we will keep to ourselves.
      </Text>

      <Text style={[styles.contentText]}>
        SURVEYS.
        The surveys are created using Google Forms. Please refer to Google's privacy policy when you use these surveys.
        Note that we don't collect your e-mail information, but Google may use it for their purposes.
      </Text>

      <Text style={[styles.contentText]}>
        USAGE DATA.
        As this app is still quite new and under heavy development, the developers are in need of user feedback. Some
        advanced app settings are available for users to change. These app settings are logged to our logging framework
        so we can keep track of what settings are used by the users and what settings are preferred (e.g. blue or black
        verse number colors). Sharing of these settings is totally optional and enabled by default. You can disable this
        under advanced settings in the settings screen.
      </Text>

      <Text style={[styles.contentText]}>
        ERROR LOGGING. Further more, error logging is collected. If your app crashes for some reason, some information
        about this crash is send to our logging framework. The developers can start their investigation using this
        information, although it's usually not much. So if you can provide us with more information, please do so using
        the Feedback option in the menu. This crash information may (not always) include information like: the error
        name, some app settings related to the crash, your device information (IP address, device type and Android
        version, but no personal information).
      </Text>

      <Text style={[styles.contentText]}>
        BACKEND. This app or it's backend doesn't collect any personal information from you. The authentication with the
        backend makes use of an identifier that is unique to your device. Don't worry, no one can link this identifier
        to your device, as we hash the device identifier before it leaves your device. The hash is irreversible, so the
        backend receives gibberish and this gibberish makes you completely anonymous. The important thing is that this
        gibberish remains the same for each device, even after app re-installs. That way the authorization with the
        backend for each device can made be persistent. The use of the hashed device ID eliminates the use of user
        accounts.
      </Text>

      <Text style={[styles.contentText]}>
        The backend may store your IP. However, your IP is stored on every server you connect with through any app you
        use, so this isn't much news. The backend doesn't sell or distribute your data in any way.
      </Text>
    </View>
  </ScrollView>);
};

export default PrivacyPolicyScreen;

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  content: {
    paddingTop: 50,
    paddingBottom: 200
  },
  contentText: {
    fontFamily: fontFamily.sansSerifLight,
    lineHeight: 25,
    marginBottom: 30,
    paddingHorizontal: 30,
    color: colors.text.default,
  },
  webpageLink: {
    textAlign: "center",
    color: colors.url
  }
});
