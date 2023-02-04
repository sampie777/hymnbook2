import React from "react";
import { ParamList, SongStringSearchRoute } from "../../../../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  navigation: NativeStackNavigationProp<ParamList> | BottomTabNavigationProp<ParamList>;
}

const StringSearchButton: React.FC<Props> = ({ navigation }) => {
  const styles = createStyles(useTheme());

  const onPress = () => {
    navigation.navigate(SongStringSearchRoute);
  };

  return <TouchableOpacity style={styles.container} onPress={onPress}>
    <Icon name={"search"} style={styles.icon} />
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 50,
    width: 50,
    backgroundColor: colors.surface1,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",

    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00
  },
  icon: {
    fontSize: 20,
    color: colors.textLighter
  }
});

export default StringSearchButton;
