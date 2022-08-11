import React from "react";
import { NativeStackNavigationProp } from "react-native-screens/src/native-stack/types";
import { ParamList, routes } from "../../../../navigation";
import { Types } from "../../downloads/TypeSelectBar";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";


interface ScreenProps {
  navigation: NativeStackNavigationProp<ParamList>;
}

const DownloadInstructions: React.FC<ScreenProps> = ({ navigation }) => {
  const styles = createStyles(useTheme());

  const onPress = () => {
    navigation.navigate(routes.Databases, { type: Types.Documents });
  };

  return (<View style={styles.container}>
    <Text style={styles.titleText}>Nothing to show</Text>
    <Text style={styles.text}>You need to download some documents first before you can use them.</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.downloadText}>Take me to downloads</Text>
    </TouchableOpacity>
  </View>);
};

export default DownloadInstructions;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 4,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.text,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: colors.text
  },
  downloadText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.url
  }
});
