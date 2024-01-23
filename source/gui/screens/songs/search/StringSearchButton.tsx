import React, { useCallback } from "react";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { ParamList, SongStringSearchRoute } from "../../../../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  navigation: NativeStackNavigationProp<ParamList> | BottomTabNavigationProp<ParamList>;
  position: SongSearch.StringSearchButtonPlacement;
}

const StringSearchButton: React.FC<Props> = ({
                                               navigation,
                                               position
                                             }) => {
  const styles = createStyles(useTheme());

  const onPress = () => {
    navigation.navigate(SongStringSearchRoute);
  };

  const { containerPositionStyle, iconPositionStyle } = useCallback(() => {
    switch (position) {
      case SongSearch.StringSearchButtonPlacement.TopLeft:
        return {
          containerPositionStyle: styles.containerTopLeft,
          iconPositionStyle: styles.iconTopLeft
        };
      case SongSearch.StringSearchButtonPlacement.BottomRight:
        return {
          containerPositionStyle: styles.containerBottomRight,
          iconPositionStyle: styles.iconBottomRight
        };
      case SongSearch.StringSearchButtonPlacement.BottomLeft:
        return {
          containerPositionStyle: styles.containerBottomLeft,
          iconPositionStyle: styles.iconBottomLeft
        };
      default:
        return {
          containerPositionStyle: {},
          iconPositionStyle: {}
        };
    }
  }, [position])();

  return <TouchableOpacity style={[styles.containerBase, containerPositionStyle]}
                           onPress={onPress}>
    <Icon name={"search"} style={[styles.icon, iconPositionStyle]} />
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  containerBase: {
    flexDirection: "row",
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
  containerTopLeft: {
    margin: 15,
    height: 50,
    width: 50,
    alignSelf: "flex-start"
  },
  containerBottomRight: {
    margin: 25,
    height: 55,
    width: 55,
    alignSelf: "flex-end"
  },
  containerBottomLeft: {
    margin: 25,
    height: 55,
    width: 55,
    alignSelf: "flex-start"
  },

  icon: {
    color: colors.text.lighter
  },
  iconTopLeft: { fontSize: 20 },
  iconTopRight: { fontSize: 20 },
  iconBottomRight: { fontSize: 22 },
  iconBottomLeft: { fontSize: 22 }
});

export default StringSearchButton;
