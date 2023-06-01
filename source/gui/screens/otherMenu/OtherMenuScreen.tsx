import React, { useState } from "react";
import { Types } from "../downloads/TypeSelectBar";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs/src/types";
import { StyleProp, StyleSheet, TextStyle } from "react-native";
import { shareApp } from "../../../logic/utils";
import { Survey } from "../../../logic/survey";
import { AboutRoute, DatabasesRoute, OtherMenuRoute, ParamList, SettingsRoute } from "../../../navigation";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome5";
import MenuItem from "./MenuItem";
import FeedbackComponent from "../../components/popups/FeedbackComponent";

interface MenuItemProps {
  name?: string;
  route?: string;
  icon?: (style?: StyleProp<TextStyle> | undefined) => React.ReactElement;
  onPress?: () => void;
  hasNotification?: boolean;
}

const OtherMenuScreen: React.FC<BottomTabScreenProps<ParamList, typeof OtherMenuRoute>> =
  ({ navigation }) => {
    const styles = createStyles(useTheme());
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

    const routesToShow: MenuItemProps[] = [
      {
        route: DatabasesRoute,
        name: "Song databases",
        icon: (style) => <Icon name="music" style={style} />
      },
      {
        name: "Document databases",
        icon: (style) => <Icon name="file-alt" style={style} />,
        onPress: () => navigation.navigate(DatabasesRoute, { type: Types.Documents })
      },
      {
        route: SettingsRoute,
        icon: (style) => <Icon name="cog" style={style} />
      },
      {
        name: "Give feedback",
        icon: (style) => <Icon name="comment" style={style} />,
        onPress: () => setShowFeedbackPopup(true),
        hasNotification: Survey.mayBeShown()
      },
      {
        route: AboutRoute,
        icon: (style) => <Icon name="info" style={style} />
      },
      {
        name: "Share app with friends",
        icon: (style) => <Icon name="share" style={style} />,
        onPress: shareApp
      }
    ];

    const onPress = (route?: string) => {
      if (route) {
        // @ts-ignore
        navigation.navigate(route);
      }
    };

    return (<>
      {!showFeedbackPopup ? undefined :
        <FeedbackComponent onCompleted={() => setShowFeedbackPopup(false)}
                           onDenied={() => setShowFeedbackPopup(false)} />
      }
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollView}>
        {routesToShow.map((it, index) => <MenuItem
          key={index.toString() + (it.name || it.route)}
          text={it.name || it.route || ""}
          icon={it.icon}
          onPress={it.onPress ? it.onPress : () => onPress(it.route)}
          hasNotification={it.hasNotification} />)}
      </ScrollView>
    </>);
  };

export default OtherMenuScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollView: {
    paddingTop: 1,
    paddingBottom: 20
  }
});
