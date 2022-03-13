import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { displayName, homepage } from "../../../app.json";
import Config from "react-native-config";
import Icon from "react-native-vector-icons/FontAwesome5";
import { getVersion } from "react-native-device-info";
import UrlLink from "../../components/UrlLink";
import { routes } from "../../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";


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

      <View style={styles.footerContainer}>
        <Text style={[styles.contentText, styles.footerText]}>
          Made with passion by S. Jansen
        </Text>

        <View style={[styles.row, styles.contactLinks]}>
          <UrlLink url={homepage}>
            <View style={styles.row}>
              <FontAwesome5Icon name={"globe"} style={styles.webpageLink} />
              <Text style={styles.webpageLink}>My projects</Text>
            </View>
          </UrlLink>

          <UrlLink url={`mailto:${Config.DEVELOPER_EMAIL}`}>
            <View style={styles.row}>
              <FontAwesome5Icon name={"envelope"} style={styles.webpageLink} />
              <Text style={styles.webpageLink}>Mail me</Text>
            </View>
          </UrlLink>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate(routes.PrivacyPolicy)}>
          <Text style={styles.webpageLink}>
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
    backgroundColor: colors.background
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },

  headerContainer: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 80,
    borderBottomColor: colors.border
  },
  headerTitle: {
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 15,
    flexDirection: "row"
  },
  titleIcon: {
    color: colors.primary,
    fontSize: 30
  },
  titleContent: {
    paddingLeft: 18,
    color: colors.primary,
    fontSize: 28,
    fontFamily: "sans-serif-light"
  },
  versionText: {
    color: colors.textLighter,
    fontSize: 12,
    fontFamily: "sans-serif-light"
  },

  content: {},
  contentText: {
    fontFamily: "sans-serif-light",
    lineHeight: 25,
    marginBottom: 25,
    paddingHorizontal: 30,
    color: colors.text
  },

  scriptureContainer: {
    alignSelf: "center",
    marginBottom: 45,
    paddingHorizontal: 20,
    backgroundColor: colors.surface1,
    paddingVertical: 30
  },
  scriptureText: {
    fontFamily: "serif",
    fontStyle: "italic",
    textAlign: "center",
    color: colors.textLight,
    marginBottom: 10,
    fontSize: 13
  },
  scriptureSourceText: {
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "serif",
    color: colors.textLighter,
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
    backgroundColor: colors.surface1
  },
  contributionText: {
    marginBottom: 40
  },
  donationLink: {
    marginBottom: 20
  },
  donationLinkText: {
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    borderRadius: 80,
    marginBottom: 0,
    paddingVertical: 15,
    paddingHorizontal: 50,
    color: colors.onPrimary,
    fontWeight: "bold"
  },

  footerContainer: {
    paddingTop: 80,
    paddingBottom: 80,
    backgroundColor: colors.surface3
  },
  footerText: {
    fontFamily: "sans-serif",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 0,
    fontSize: 13,
    color: colors.onPrimary,
    opacity: 0.8
  },
  webpageLink: {
    textAlign: "center",
    fontSize: 13,
    color: colors.url,
    fontFamily: "sans-serif-light",
    lineHeight: 25,
    paddingHorizontal: 3,
    paddingVertical: 10
  },
  contactLinks: {
    marginBottom: 20,
    justifyContent: "space-evenly"
  }
});
