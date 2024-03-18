import React, { useCallback } from "react";
import { SongSearch } from "../../../../logic/songs/songSearch";
import { ParamList, SongStringSearchRoute } from "../../../../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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

  const { containerPositionStyle, buttonPositionStyle, iconPositionStyle } = useCallback(() => {
    switch (position) {
      case SongSearch.StringSearchButtonPlacement.TopLeft:
        return {
          containerPositionStyle: styles.containerTopLeft,
          buttonPositionStyle: styles.buttonTopLeft,
          iconPositionStyle: styles.iconTopLeft
        };
      case SongSearch.StringSearchButtonPlacement.BottomRight:
        return {
          containerPositionStyle: styles.containerBottomRight,
          buttonPositionStyle: styles.buttonBottomRight,
          iconPositionStyle: styles.iconBottomRight
        };
      case SongSearch.StringSearchButtonPlacement.BottomLeft:
        return {
          containerPositionStyle: styles.containerBottomLeft,
          buttonPositionStyle: styles.buttonBottomLeft,
          iconPositionStyle: styles.iconBottomLeft
        };
      default:
        return {
          containerPositionStyle: {},
          iconPositionStyle: {}
        };
    }
  }, [position])();

  return <View style={[styles.containerBase, containerPositionStyle]}>
    <TouchableOpacity style={[styles.button, buttonPositionStyle]}
                      onPress={onPress}>
      <Icon name={"search"} style={[styles.icon, iconPositionStyle]} />
    </TouchableOpacity>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  containerBase: {
    bottom: 20,
    flex: 1,
    justifyContent: "flex-end",
  },
  containerTopLeft: {
    alignSelf: "flex-end"
  },
  containerBottomRight: {
    alignSelf: "flex-end"
  },
  containerBottomLeft: {
    alignSelf: "flex-start"
  },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface1,
    borderRadius: 50,
    height: 50,
    width: 50,

    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00
  },
  buttonTopLeft: {
    height: 50,
    width: 50
  },
  buttonBottomRight: {
    marginRight: 25,
    marginBottom: 5,
    height: 55,
    width: 55
  },
  buttonBottomLeft: {
    marginLeft: 25,
    marginBottom: 5,
    height: 55,
    width: 55
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
