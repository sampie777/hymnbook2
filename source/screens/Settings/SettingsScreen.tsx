import React, { MutableRefObject, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import Settings from "../../settings";
import { ServerAuth } from "../../scripts/server/auth";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useFocusEffect } from "@react-navigation/native";
import { SettingComponent, SettingsSliderComponent, SettingSwitchComponent } from "./SettingComponent";
import { AccessRequestStatus } from "../../scripts/server/models";
import { rollbar } from "../../scripts/rollbar";
import { capitalize, isAndroid } from "../../scripts/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

const Header: React.FC<{ title: string, isVisible?: boolean }> = ({ title, isVisible = true }) => {
  const styles = createStyles(useTheme());
  return !isVisible ? null : <Text style={styles.settingHeader}>{title}</Text>;
};

const SettingsScreen: React.FC = () => {
  const confirmModalCallback: MutableRefObject<((isConfirmed: boolean) => void) | undefined> =
    useRef(undefined);
  const [confirmModalMessage, setConfirmModalMessage] = useState<string | undefined>(undefined);
  const [isReloading, setReloading] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showDevSettings, setShowDevSettings] = useState(process.env.NODE_ENV === "development");
  const [easterEggEnableDevModeCount, setEasterEggEnableDevModeCount] = useState(0);
  const theme = useTheme();
  const styles = createStyles(theme);

  const confirmModalCallbackWrapper = (isConfirmed: boolean) => {
    setConfirmModalMessage(undefined);
    confirmModalCallback.current?.(isConfirmed);
  };

  const setConfirmModalCallback = (message: string | undefined, callback: ((isConfirmed: boolean) => void) | undefined) => {
    if (message === undefined || callback === undefined) {
      setConfirmModalMessage(undefined);
      return;
    }

    confirmModalCallback.current = callback;
    setConfirmModalMessage(message);
  };

  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return onBlur;
    }, [])
  );

  const onFocus = () => {
    reloadSettings();
  };

  const onBlur = () => {
    Settings.store();
  };


  const reloadSettings = () => {
    setReloading(true);
    setTimeout(() => setReloading(false), 100);
  };

  const increaseEasterEggDevMode = () => {
    if (showDevSettings) {
      return;
    }

    setEasterEggEnableDevModeCount(easterEggEnableDevModeCount + 1);
    if (easterEggEnableDevModeCount >= 9) {
      setShowDevSettings(true);
      rollbar.info("Someone switched on developer mode: " + ServerAuth.getDeviceId());
      if (isAndroid) {
        ToastAndroid.show("You're now a developer!", ToastAndroid.LONG);
      }
    }
  };

  function getAuthenticationStateAsMessage() {
    if (ServerAuth.isAuthenticated()) {
      return "Approved as " + Settings.authClientName;
    } else if (Settings.authStatus === AccessRequestStatus.DENIED) {
      return "Denied: " + Settings.authDeniedReason;
    } else if (Settings.authStatus === AccessRequestStatus.REQUESTED) {
      return "Requested...";
    }
    return "Not authenticated";
  }

  const authenticationStatus = getAuthenticationStateAsMessage();

  const developerSettings = <>
    <Header title={"Developer"} />
    <SettingSwitchComponent title={"Enable documents"}
                            keyName={"enableDocumentsFeatureSwitch"} />
    <SettingSwitchComponent title={"Survey completed"}
                            keyName={"surveyCompleted"} />
    <SettingComponent title={"App opened times"}
                      keyName={"appOpenedTimes"}
                      onPress={(setValue) => setValue(0)} />
  </>;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl onRefresh={reloadSettings}
                                        refreshing={isReloading} />}>

        <ConfirmationModal isOpen={confirmModalMessage !== undefined}
                           onClose={() => confirmModalCallbackWrapper(false)}
                           onConfirm={() => confirmModalCallbackWrapper(true)}
                           message={confirmModalMessage} />

        <SettingSwitchComponent title={"Show advanced settings"}
                                value={showAdvancedSettings}
                                lessObviousStyling={true}
                                onPress={(setValue, sKey, newValue) => {
                                  setValue(newValue);
                                  setShowAdvancedSettings(newValue);
                                  increaseEasterEggDevMode();
                                }} />

        {isReloading ? null : <>
          <Header title={"Display"} />
          <SettingComponent title={"Song letter size"}
                            keyName={"songScale"}
                            onPress={(setValue) => setValue(1)}
                            valueRender={(it) => {
                              if (it === 1.0) {
                                return "100 %";
                              }
                              return Math.round(it * 100) + " % (press to reset)";
                            }} />
          <SettingsSliderComponent title={"Song melody size"}
                                   keyName={"songMelodyScale"}
                                   description={"The size of the melody notes. Not the size of the song text."}
                                   isVisible={showAdvancedSettings && Settings.showMelody}
                                   valueRender={(it) => {
                                     if (it === 1.0) {
                                       return "100 %";
                                     }
                                     return Math.round(it * 100) + " %";
                                   }} />
          <SettingComponent title={"Theme"}
                            keyName={"theme"}
                            onPress={(setValue) => {
                              let newValue = "";
                              if (Settings.theme === "")
                                newValue = "dark";
                              if (Settings.theme === "dark")
                                newValue = "light";

                              setValue(newValue);
                              theme.reload();
                            }}
                            valueRender={(it: string) => {
                              if (it === "") {
                                return "System (auto)";
                              }
                              return capitalize(it);
                            }} />
          <SettingSwitchComponent title={"Keep screen on"}
                                  keyName={"keepScreenAwake"} />
          <SettingSwitchComponent title={"Use colored verse numbers"}
                                  keyName={"coloredVerseTitles"} />
          <SettingSwitchComponent title={"Highlight selected verses"}
                                  description={"Give verse titles an accent when selected"}
                                  keyName={"highlightSelectedVerses"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Animate scrolling"}
                                  description={"Disable this if scrolling isn't performing smooth"}
                                  keyName={"animateScrolling"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Animate song loading"}
                                  description={"Use fade-in effect when showing a song"}
                                  keyName={"songFadeIn"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"\"Jump to next verse\" button"}
                                  description={"Show this button in the bottom right corner"}
                                  keyName={"showJumpToNextVerseButton"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Use native list component for song verses"}
                                  description={"Try to enable this if pinch-to-zoom or scrolling glitches"}
                                  keyName={"useNativeFlatList"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Display song list size badge"}
                                  keyName={"showSongListCountBadge"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Show melody (experimental)"}
                                  description={"Show song melody above lyrics. This is a work in progress and might not function as it should."}
                                  keyName={"showMelody"}
                                  isVisible={showAdvancedSettings} />

          <Header title={"Other"} />
          <SettingSwitchComponent title={"Clear search after adding song to song list"}
                                  keyName={"clearSearchAfterAddedToSongList"} />
          {!Settings.enableDocumentsFeatureSwitch ? undefined :
            <SettingSwitchComponent title={"Multi keyword search for documents"}
                                    description={"When enabled, each keyword will be matched individually instead of " +
                                    "the whole search phrase. This will yield more results."}
                                    keyName={"documentsMultiKeywordSearch"}
                                    isVisible={showAdvancedSettings} />
          }

          <Header title={"Backend"} isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Use authentication with backend"}
                                  description={"Disabling this probably won't help you"}
                                  keyName={"useAuthentication"}
                                  isVisible={showAdvancedSettings} />
          <SettingComponent title={"Authentication status with backend"}
                            value={authenticationStatus}
                            isVisible={showAdvancedSettings}
                            valueRender={(it) => {
                              if (Settings.authStatus === AccessRequestStatus.UNKNOWN) {
                                return it;
                              }
                              return it + " (press to reset)";
                            }}
                            onPress={(setValue) =>
                              setConfirmModalCallback(
                                "Reset/forget authentication?",
                                (isConfirmed) => {
                                  if (isConfirmed) {
                                    ServerAuth.forgetCredentials();
                                  }
                                  setValue(getAuthenticationStateAsMessage);
                                })} />

          {!showDevSettings ? undefined : developerSettings}

        </>}
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContainer: {
    paddingBottom: 100
  },

  settingHeader: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
    color: "#999"
  }
});
