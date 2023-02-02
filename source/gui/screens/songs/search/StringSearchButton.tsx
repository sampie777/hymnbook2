import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamList, SongStringSearchRoute } from "../../../../navigation";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";

interface Props {
  navigation: NativeStackNavigationProp<ParamList> | BottomTabNavigationProp<ParamList>;
}

const StringSearchButton: React.FC<Props> = ({ navigation }) => {
  const styles = createStyles(useTheme());

  const onPress = () => {
    navigation.navigate(SongStringSearchRoute);
  };

  return <TouchableOpacity style={styles.container} onPress={onPress}>
    <Text style={styles.text}>
      T
      <Text style={styles.textSmaller}>T</Text>
    </Text>
    <Icon name={"search"} style={styles.icon} />
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.surface1,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  text: {
    fontSize: 18,
    color: colors.textLighter,
    fontWeight: "bold",
    lineHeight: 24
  },
  textSmaller: {
    fontSize: 12
  },
  icon: {
    fontSize: 16,
    color: colors.textLight,
    paddingLeft: 8
  }
});

export default StringSearchButton;
