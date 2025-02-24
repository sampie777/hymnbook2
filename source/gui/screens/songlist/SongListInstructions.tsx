import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { SearchResultItemAddButton } from "../songs/search/SearchResultItemBaseComponent";
import Icon from "react-native-vector-icons/FontAwesome5";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamList, SongSearchRoute } from "../../../navigation";

interface Props {
  navigation: NativeStackNavigationProp<ParamList, any>
}

const SongListInstructions: React.FC<Props> = ({ navigation }) => {
  const styles = createStyles(useTheme());

  return <View style={styles.container}>
    <Text style={styles.text}>Go to the {"  "}<Icon name="music" style={styles.screenIcon} />{"  "} songs screen, search for a
      song and
      tap (or hold) the following button to add it to this list:</Text>
    <SearchResultItemAddButton onPress={() => navigation.navigate(SongSearchRoute)} />
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    color: colors.text.light,
    fontSize: 16,
    lineHeight: 16 * 2,
  },
  screenIcon: {
    fontSize: 30,
    color: colors.text.lighter,
  }
});

export default SongListInstructions;
