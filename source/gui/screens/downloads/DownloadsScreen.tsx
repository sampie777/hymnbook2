import React, { useState } from "react";
import { NativeStackScreenProps } from "react-native-screens/src/native-stack/types";
import { ParamList } from "../../../navigation";
import { StyleSheet, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import TypeSelectBar, { Types } from "./TypeSelectBar";
import DownloadSongsScreen from "./DownloadSongsScreen";
import DownloadDocumentsScreen from "./DownloadDocumentsScreen";

interface Props extends NativeStackScreenProps<ParamList, "Databases"> {
}

const DownloadsScreen: React.FC<Props> = ({ route }) => {
  const [selectedType, setSelectedType] = useState(route.params.type || Types.Songs);
  const styles = createStyles(useTheme());

  const getSelectedContent = () => {
    if (selectedType === Types.Documents) {
      return <DownloadDocumentsScreen />;
    }
    return <DownloadSongsScreen />;
  };

  return <View style={styles.container}>
    <TypeSelectBar selectedType={selectedType}
                   onTypeClick={setSelectedType} />

    {getSelectedContent()}
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  }
});

export default DownloadsScreen;
