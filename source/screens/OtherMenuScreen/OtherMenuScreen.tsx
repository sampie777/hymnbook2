import React from "react";
import config from "../../config";
import { openLink } from "../../scripts/utils";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs/src/types";
import { Alert, StyleProp, StyleSheet, TextStyle } from "react-native";
import { ParamList, routes } from "../../navigation";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome5";
import MenuItem from "./MenuItem";

const OtherMenuScreen: React.FC<BottomTabScreenProps<ParamList, "OtherMenu">> =
  ({ navigation }) => {
    const styles = createStyles(useTheme());

    const routesToShow = [
      {
        name: routes.Settings,
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="cogs" style={style} />
      },
      {
        name: routes.SongImport,
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="database" style={style} />
      },
      {
        name: "Give feedback" as keyof ParamList,
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="comment" style={style} />,
        onPress: () => openLink(config.feedbackUrl)
          .catch(e => Alert.alert("Error opening link", e.message))
      },
      {
        name: routes.About,
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="info" style={style} />
      }
    ];

    const onPress = (route: keyof ParamList) => {
      navigation.navigate(route);
    };

    return (<ScrollView contentContainerStyle={styles.container}>
      {routesToShow.map(it => <MenuItem
        key={it.name}
        name={it.name}
        icon={it.icon}
        onPress={it.onPress ? it.onPress : () => onPress(it.name)} />)}
    </ScrollView>);
  };

export default OtherMenuScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 1,
  }
});
