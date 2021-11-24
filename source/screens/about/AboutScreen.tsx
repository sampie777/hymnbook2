import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { displayName, homepage } from "../../../app.json";
import Icon from "react-native-vector-icons/FontAwesome5";
import { getVersion } from "react-native-device-info";
import UrlLink from "../../components/UrlLink";
import { routes } from "../../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";


const AboutScreen: React.FC<{ navigation: NativeStackNavigationProp<any> }> = ({ navigation }) => {
  const styles = createStyles(useTheme());
  return (<ScrollView style={styles.container}>
    <View style={styles.headerContainer}>
      <View style={styles.headerTitle}>
        <Icon name={"book-open"} size={styles.titleIcon.fontSize} color={styles.titleIcon.color as string} />
        <Text style={styles.titleContent}>{displayName}</Text>
      </View>
      <Text
        style={styles.versionText}>version: {getVersion()} {process.env.NODE_ENV === "production" ? undefined : `(${process.env.NODE_ENV})`}</Text>
    </View>

    <View style={styles.content}>
      <View style={styles.scriptureContainer}>
        <Text style={[styles.contentText, styles.scriptureText]}>
          Als de HERE de bouw van een huis niet zegent, is alle moeite nutteloos.
        </Text>
        <Text style={styles.scriptureSourceText}>Psalmen 127: 1a (HTB)</Text>
      </View>

      <View style={[styles.descriptionContainer]}>
        <Text style={[styles.contentText]}>
          This app is an effort to assist Christians with a readily available, easy-to-use, digital songbook. It can be
          used in church, at home, or wherever you are.
        </Text>

        <Text style={[styles.contentText]}>
          As such apps are already available, the main focus of this app is to enhance user experience with quick
          song-look-up and easy song-list-creation.
        </Text>

        <Text style={[styles.contentText]}>
          Feedback is always welcome. If you think some licenses are incorrect, please let me know.
        </Text>
      </View>

      <View style={styles.donationContainer}>
        <Text style={[styles.contentText, styles.contributionText]}>
          This app is made free in order to make the access to Christian songs available for everyone with a digital
          device. As no profit is made, this app fully depend on donations. If you want to contribute or show your
          thanks,
          please consider donating using the following option:
        </Text>

        <UrlLink url={"https://www.buymeacoffee.com/sajansen"} style={styles.donationLink}>
          <Text style={[styles.contentText, styles.donationLinkText]}>
            Buy me a coffee
          </Text>
        </UrlLink>
        {/*<View style={styles.donationLink}>*/}
        {/*  <Text style={[styles.contentText, styles.donationLinkText]}>*/}
        {/*    Directly using PayPal*/}
        {/*  </Text>*/}
        {/*</View>*/}
      </View>

      <View style={styles.greetingContainer}>
        <Text style={[styles.contentText, styles.greetingText]}>
          Made with passion by S. Jansen
        </Text>
        <UrlLink url={homepage}>
          <Text style={[styles.contentText, styles.webpageLink]}>{homepage}</Text>
        </UrlLink>

        <TouchableOpacity onPress={() => navigation.navigate(routes.PrivacyPolicy)}>
          <Text style={[styles.contentText, styles.webpageLink]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>);
};

export default AboutScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.height0
  },

  headerContainer: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 80,
    borderBottomColor: colors.border0
  },
  headerTitle: {
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 15,
    flexDirection: "row"
  },
  titleIcon: {
    color: colors.tint,
    fontSize: 30
  },
  titleContent: {
    paddingLeft: 18,
    color: colors.tint,
    fontSize: 28,
    fontFamily: "sans-serif-light"
  },
  versionText: {
    color: colors.text3,
    fontSize: 12,
    fontFamily: "sans-serif-light"
  },

  content: {},
  contentText: {
    fontFamily: "sans-serif-light",
    lineHeight: 25,
    marginBottom: 25,
    paddingHorizontal: 30,
    color: colors.text0,
  },

  scriptureContainer: {
    alignSelf: "center",
    marginBottom: 45,
    paddingHorizontal: 20,
    backgroundColor: colors.height1,
    paddingVertical: 30,
  },
  scriptureText: {
    fontFamily: "serif",
    fontStyle: "italic",
    textAlign: "center",
    color: colors.text1,
    marginBottom: 10,
    fontSize: 13
  },
  scriptureSourceText: {
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "serif",
    color: colors.text2,
    fontSize: 10
  },

  descriptionContainer: {
    marginTop: 10,
    marginBottom: 40
  },

  donationContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 45,
    backgroundColor: colors.height1,
  },
  contributionText: {
    marginBottom: 40,
  },
  donationLink: {
    marginBottom: 20
  },
  donationLinkText: {
    backgroundColor: colors.tintLight,
    alignItems: "center",
    borderRadius: 80,
    marginBottom: 0,
    paddingVertical: 15,
    paddingHorizontal: 50,
    color: colors.text0,
    fontWeight: "bold"
  },

  greetingContainer: {
    paddingTop: 80,
    paddingBottom: 80,
    backgroundColor: colors.height6
  },
  greetingText: {
    fontFamily: "sans-serif",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 0,
    fontSize: 13,
    color: colors.text4
  },
  webpageLink: {
    textAlign: "center",
    fontSize: 13,
    color: colors.url0
  }
});
