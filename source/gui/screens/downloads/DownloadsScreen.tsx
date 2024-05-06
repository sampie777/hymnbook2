import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DatabasesRoute, ParamList } from "../../../navigation";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import TypeSelectBar, { Types } from "./TypeSelectBar";
import DownloadSongsScreen from "./DownloadSongsScreen";
import DownloadDocumentsScreen from "./DownloadDocumentsScreen";

interface Props extends NativeStackScreenProps<ParamList, typeof DatabasesRoute> {
}

const DownloadsScreen: React.FC<Props> = ({ route }) => {
  const [selectedType, setSelectedType] = useState(route.params.type || Types.Songs);
  const [promptForUuid, setPromptForUuid] = useState(route.params.promptForUuid);
  const [isProcessing, setIsProcessing] = useState(false);
  const styles = createStyles(useTheme());

  const dismissPromptForUuid = () => setPromptForUuid(undefined);

  const getSelectedContent = () => {
    if (selectedType === Types.Documents) {
      return <DownloadDocumentsScreen setIsProcessing={setIsProcessing}
                                      promptForUuid={route.params.type === Types.Documents ? promptForUuid : undefined}
                                      dismissPromptForUuid={dismissPromptForUuid} />;
    }
    return <DownloadSongsScreen setIsProcessing={setIsProcessing}
                                promptForUuid={route.params.type === Types.Songs ? promptForUuid : undefined}
                                dismissPromptForUuid={dismissPromptForUuid} />;
  };

  return <View style={styles.container}>
    <TypeSelectBar selectedType={selectedType}
                   onTypeClick={setSelectedType}
                   isProcessing={isProcessing} />

    <ScrollView style={{ flex: 1 }} nestedScrollEnabled={true}>
      {getSelectedContent()}
    </ScrollView>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  }
});

export default DownloadsScreen;
