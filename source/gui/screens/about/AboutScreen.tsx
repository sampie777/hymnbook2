import React from "react";
import { displayName } from "../../../../app.json";
import Config from "react-native-config";
import { getBuildNumber, getVersion } from "react-native-device-info";
import { useFeatures } from "../../components/providers/FeaturesProvider";
import { AboutRoute, ParamList, PrivacyPolicyRoute } from "../../../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import Icon from "react-native-vector-icons/FontAwesome5";
import UrlLink from "../../components/UrlLink";
import PayPalPaymentButton from "../../components/donations/PayPalPaymentButton";
import BuyMeACoffeePaymentButton from "../../components/donations/BuyMeACoffeePaymentButton";
import DonationForm from "../../components/donations/DonationForm";
import { isAndroid, isIOS } from "../../../logic/utils";


const AboutScreen: React.FC<{
  navigation: NativeStackNavigationProp<ParamList, typeof AboutRoute>
}> = ({ navigation }) => {
  const styles = createStyles(useTheme());
  const { goldenEgg, enableSystemPay } = useFeatures();

  return (<ScrollView style={styles.container}>
    <View style={styles.headerContainer}>
      <View style={styles.headerTitle}>
        <Icon name={"book-open"} size={styles.titleIcon.fontSize} color={styles.titleIcon.color as string} />
        <Text style={styles.titleContent}>{displayName}</Text>
      </View>
      <Text style={styles.versionText}
            selectable={true}>
        version: {getVersion()} ({getBuildNumber()}) {process.env.NODE_ENV === "production" ? undefined : `(${process.env.NODE_ENV})`}
      </Text>
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
          device. As no profit is made, this app fully depends on donations.
          If you want to show your thanks, please consider supporting this good cause:
        </Text>

        {enableSystemPay
          ? <DonationForm />
          : <Text style={[styles.contentText]}>{isAndroid ? "Google Pay" : (isIOS ? "Apple Pay" : "This")} feature is not available yet.</Text>}

        {!goldenEgg ? undefined :
          <View style={styles.donationLinksContainer}>
            {enableSystemPay
              ? <Text style={[styles.contentText, styles.contributionText]}>You can also use these options:</Text>
              : null}
            <BuyMeACoffeePaymentButton />
            <PayPalPaymentButton />
          </View>
        }
      </View>

      <View style={styles.footerContainer}>
        <Text style={[styles.contentText, styles.footerText]}>
          Made with passion by S. Jansen
        </Text>

        <View style={[styles.row, styles.contactLinks]}>
          <UrlLink url={`mailto:${Config.DEVELOPER_EMAIL}?subject=Hymnbook`}>
            <View style={styles.row}>
              <FontAwesome5Icon name={"envelope"} style={styles.webpageLink} />
              <Text style={styles.webpageLink}
                    importantForAccessibility={"auto"}>
                Mail me
              </Text>
            </View>
          </UrlLink>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate(PrivacyPolicyRoute)}>
          <Text style={styles.webpageLink}
                importantForAccessibility={"auto"}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>);
};

export default AboutScreen;

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
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
    borderBottomColor: colors.border.default
  },
  headerTitle: {
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 15,
    flexDirection: "row"
  },
  titleIcon: {
    color: colors.primary.default,
    fontSize: 30
  },
  titleContent: {
    paddingLeft: 18,
    color: colors.primary.default,
    fontSize: 28,
    fontFamily: fontFamily.sansSerifLight
  },
  versionText: {
    color: colors.text.lighter,
    fontSize: 12,
    fontFamily: fontFamily.sansSerifLight
  },

  content: {},
  contentText: {
    fontFamily: fontFamily.sansSerifLight,
    lineHeight: 25,
    marginBottom: 25,
    paddingHorizontal: 30,
    color: colors.text.default
  },

  scriptureContainer: {
    alignSelf: "center",
    marginBottom: 45,
    paddingHorizontal: 20,
    backgroundColor: colors.surface1,
    paddingVertical: 30
  },
  scriptureText: {
    fontFamily: fontFamily.sansSerif,
    fontStyle: "italic",
    textAlign: "center",
    color: colors.text.light,
    marginBottom: 10,
    fontSize: 13
  },
  scriptureSourceText: {
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: fontFamily.sansSerif,
    color: colors.text.lighter,
    fontSize: 10
  },

  descriptionContainer: {
    marginTop: 10,
    marginBottom: 40
  },

  donationContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 60,
    backgroundColor: colors.surface1
  },
  contributionText: {
    marginBottom: 40
  },
  donationLinksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 15,
  },
  donationLink: {
    marginBottom: 20,
    overflow: "hidden"
  },

  footerContainer: {
    paddingTop: 80,
    paddingBottom: 80,
    backgroundColor: colors.surface3
  },
  footerText: {
    fontWeight: "normal",
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
    fontFamily: fontFamily.sansSerifLight,
    lineHeight: 25,
    paddingHorizontal: 3,
    paddingVertical: 10
  },
  contactLinks: {
    marginBottom: 20,
    justifyContent: "space-evenly"
  }
});
