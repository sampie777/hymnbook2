import React, { useState } from "react";
import { Types } from "../downloads/TypeSelectBar";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs/src/types";
import { StyleProp, StyleSheet, TextStyle } from "react-native";
import { AboutRoute, DatabasesRoute, OtherMenuRoute, ParamList, SettingsRoute } from "../../../navigation";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome5";
import MenuItem from "./MenuItem";
import FeedbackComponent from "../../components/popups/FeedbackComponent";

const OtherMenuScreen: React.FC<BottomTabScreenProps<ParamList, typeof OtherMenuRoute>> =
  ({ navigation }) => {
    const styles = createStyles(useTheme());
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

    const oShowRoute = [
      {
        route: DatabasesRoute,
        name: "Song databases",
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="music" style={style} />
      },
      {
        name: "Document databases",
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="file-alt" style={style} />,
        onPress: () => navigation.navigate(DatabasesRoute, { type: Types.Documents })
      },
      {
        route: SettingsRoute,
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="cog" style={style} />
      },
      {
        name: "Give feedback",
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="comment" style={style} />,
        onPress: () => setShowFeedbackPopup(true)
      },
      {
        route: AboutRoute,
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="info" style={style} />
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
      <ScrollView contentContainerStyle={styles.container}>
        {oShowRoute.map(it => <MenuItem
          key={it.name || it.route}
          name={it.name || it.route || ""}
          icon={it.icon}
          onPress={it.onPress ? it.onPress : () => onPress(it.route)} />)}
      </ScrollView>
    </>);
  };

export default OtherMenuScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 1
  }
});
