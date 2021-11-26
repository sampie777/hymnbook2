import React from "react";
import { StyleProp, StyleSheet, TextStyle } from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { routes } from "../../navigation";
import { ScrollView } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";
import MenuItem from "./MenuItem";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

const OtherMenuScreen: React.FC<{ route: any, navigation: BottomTabNavigationProp<any> }> =
  ({ navigation }) => {
    const styles = createStyles(useTheme());

    const routesToShow = [
      {
        name: routes.Settings,
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="cogs" style={style} />
      },
      {
        name: routes.Import,
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="database" style={style} />
      },
      {
        name: routes.About,
        icon: (style?: StyleProp<TextStyle> | undefined) => <Icon name="info" style={style} />
      }
    ];

    const onPress = (route: string) => {
      navigation.navigate(route);
    };

    return (<ScrollView contentContainerStyle={styles.container}>
      {routesToShow.map(it => <MenuItem
        key={it.name}
        name={it.name}
        icon={it.icon}
        onPress={() => onPress(it.name)} />)}
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
