import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DatabasesRoute, ParamList } from "../../../navigation";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import TypeSelectBar, { Types } from "./TypeSelectBar";
import DownloadSongsScreen from "./DownloadSongsScreen";
import DownloadDocumentsScreen from "./DownloadDocumentsScreen";
import Icon from "react-native-vector-icons/FontAwesome5";
import SafeText from "../../components/SafeText";
import { databaseApiEndpoint, isLocalhostServer } from "../../../logic/api";

interface Props extends NativeStackScreenProps<ParamList, typeof DatabasesRoute> {
}

const DownloadsScreen: React.FC<Props> = ({ route }) => {
  const [selectedType, setSelectedType] = useState(route.params.type || Types.Songs);
  const [promptForUuid, setPromptForUuid] = useState(route.params.promptForUuid);
  const [isProcessing, setIsProcessing] = useState(false);
  const theme = useTheme();
  const styles = createStyles(theme);

  const dismissPromptForUuid = () => setPromptForUuid(undefined);

  const isLocalhost = isLocalhostServer(databaseApiEndpoint);

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
    {isLocalhost ? (
      <View style={styles.localhostBanner} testID="localhost-banner">
        <Icon name="server" size={12} color={theme.colors.text.warning as string} style={styles.localhostBannerIcon} />
        <SafeText style={styles.localhostBannerText}>
          Non-production server: <SafeText style={styles.localhostBannerHost}>{databaseApiEndpoint}</SafeText>
        </SafeText>
      </View>
    ) : null}

    <TypeSelectBar selectedType={selectedType}
                   onTypeClick={setSelectedType}
                   isProcessing={isProcessing} />

    <ScrollView style={{ flex: 1 }} nestedScrollEnabled={true}>
      {getSelectedContent()}
    </ScrollView>
  </View>;
};

const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  localhostBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: isDark ? "rgba(255, 145, 0, 0.15)" : "#fff3e0",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: isDark ? "rgba(255, 145, 0, 0.35)" : "#ffe0b2",
    gap: 8,
  },
  localhostBannerIcon: {
    marginRight: 2,
  },
  localhostBannerText: {
    fontSize: 12,
    color: colors.text.default,
  },
  localhostBannerHost: {
    fontWeight: "bold",
    color: colors.text.warning,
  },
});

export default DownloadsScreen;
