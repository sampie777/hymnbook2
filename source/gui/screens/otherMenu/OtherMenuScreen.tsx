import React, { useState } from "react";
import { Types } from "../downloads/TypeSelectBar";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs/src/types";
import { StyleProp, StyleSheet, TextStyle } from "react-native";
import { shareApp } from "../../../logic/utils";
import { Survey } from "../../../logic/survey";
import { AboutRoute, DatabasesRoute, OtherMenuRoute, ParamList, SettingsRoute } from "../../../navigation";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome5";
import MenuItem from "./MenuItem";
import FeedbackComponent from "../../components/popups/FeedbackComponent";
import { IsDownloadingIcon } from "../downloads/common";
import { useUpdaterContext } from "../../components/providers/UpdaterContextProvider";

interface MenuItemProps {
  name?: string;
  route?: string;
  icon?: (style?: StyleProp<TextStyle> | undefined) => React.ReactElement;
  onPress?: () => void;
  hasNotification?: boolean;
  statusIcon?: React.ReactElement;
}

const OtherMenuScreen: React.FC<BottomTabScreenProps<ParamList, typeof OtherMenuRoute>> =
  ({ navigation }) => {
    const styles = createStyles(useTheme());
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const updaterContext = useUpdaterContext();

    const routesToShow: MenuItemProps[] = [
      {
        route: DatabasesRoute,
        name: "Song databases",
        icon: (style) => <Icon name="music"
                               style={style as StyleProp<any> /* Set this type as TypeScript does weird things... */} />,
        statusIcon: updaterContext.songBundlesUpdating.length > 0 ? <IsDownloadingIcon /> : undefined,
      },
      {
        name: "Document databases",
        icon: (style) => <Icon name="file-alt" style={style as StyleProp<any>} />,
        onPress: () => navigation.navigate(DatabasesRoute, { type: Types.Documents }),
        statusIcon: updaterContext.documentGroupsUpdating.length > 0 ? <IsDownloadingIcon /> : undefined,
      },
      {
        route: SettingsRoute,
        icon: (style) => <Icon name="cog" style={style as StyleProp<any>} />
      },
      {
        name: "Give feedback",
        icon: (style) => <Icon name="comment" style={style as StyleProp<any>} />,
        onPress: () => setShowFeedbackPopup(true),
        hasNotification: Survey.mayBeShown()
      },
      {
        route: AboutRoute,
        icon: (style) => <Icon name="info" style={style as StyleProp<any>} />
      },
      {
        name: "Share app with friends",
        icon: (style) => <Icon name="share" style={style as StyleProp<any>} />,
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
          hasNotification={it.hasNotification}
          statusIcon={it.statusIcon} />)}
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
