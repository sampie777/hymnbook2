import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DatabasesRoute, ParamList } from "../../../../navigation";
import { Types } from "../../downloads/TypeSelectBar";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { useSongBundleCount } from "../../../components/utils";

interface ScreenProps {
  navigation: NativeStackNavigationProp<ParamList> | BottomTabNavigationProp<ParamList>;
}

const DownloadInstructions: React.FC<ScreenProps> = ({ navigation }) => {
  const bundlesCount = useSongBundleCount();
  const styles = createStyles(useTheme());

  const onPress = () => {
    navigation.navigate(DatabasesRoute, { type: Types.Songs });
  };

  if (bundlesCount() > 0) return null;

  return <View style={styles.background}>
    <View style={styles.container}>
      <Text style={styles.text}>You need to download some song bundles first before you can use them.</Text>
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <Text style={styles.downloadText}
              importantForAccessibility={"auto"}>
          Take me to downloads </Text>
      </TouchableOpacity>
    </View>
  </View>;
};

export default DownloadInstructions;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: (colors.background as string) + "cc"
  },
  container: {
    flex: 4,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 30
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.text.default,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: colors.text.default
  },
  button: {
    marginTop: 25,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary.variant,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadText: {
    fontSize: 16,
    color: colors.onPrimary,
    textAlign: "center"
  }
});
