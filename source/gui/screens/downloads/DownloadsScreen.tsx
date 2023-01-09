import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DatabasesRoute, ParamList } from "../../../navigation";
import { StyleSheet, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import TypeSelectBar, { Types } from "./TypeSelectBar";
import DownloadSongsScreen from "./DownloadSongsScreen";
import DownloadDocumentsScreen from "./DownloadDocumentsScreen";

interface Props extends NativeStackScreenProps<ParamList, typeof DatabasesRoute> {
}

const DownloadsScreen: React.FC<Props> = ({ route }) => {
  const [selectedType, setSelectedType] = useState(route.params.type || Types.Songs);
  const [isProcessing, setIsProcessing] = useState(false);
  const styles = createStyles(useTheme());

  const getSelectedContent = () => {
    if (selectedType === Types.Documents) {
      return <DownloadDocumentsScreen setIsProcessing={setIsProcessing} />;
    }
    return <DownloadSongsScreen setIsProcessing={setIsProcessing} />;
  };

  return <View style={styles.container}>
    <TypeSelectBar selectedType={selectedType}
                   onTypeClick={setSelectedType}
                   isProcessing={isProcessing} />

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
