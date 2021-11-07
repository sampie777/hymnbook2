import React, { MutableRefObject, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid } from "react-native";
import Settings from "../../scripts/settings";
import { ServerAuth } from "../../scripts/server/auth";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useFocusEffect } from "@react-navigation/native";
import { SettingComponent, SettingSwitchComponent } from "./SettingComponent";
import { AccessRequestStatus } from "../../scripts/server/models";
import { rollbar } from "../../scripts/rollbar";

const Header: React.FC<{ title: string, isVisible?: boolean }> = ({ title, isVisible = true }) =>
  !isVisible ? null : (
    <Text style={styles.settingHeader}>{title}</Text>
  );

const SettingsScreen: React.FC = () => {
  const confirmModalCallback: MutableRefObject<((isConfirmed: boolean) => void) | undefined> =
    useRef(undefined);
  const [confirmModalMessage, setConfirmModalMessage] = useState<string | undefined>(undefined);
  const [isReloading, setReloading] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showDevSettings, setShowDevSettings] = useState(process.env.NODE_ENV !== "development");
  const [easterEggEnableDevModeCount, setEasterEggEnableDevModeCount] = useState(0);

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
  };


  const reloadSettings = () => {
    setReloading(true);
    setTimeout(() => setReloading(false), 100);
  };

  const increaseEasterEggDevMode = () => {
    setEasterEggEnableDevModeCount(easterEggEnableDevModeCount + 1);
    if (easterEggEnableDevModeCount == 9) {
      setShowDevSettings(true);
      rollbar.info("Someone switched on developer mode: " + ServerAuth.getDeviceId());
      ToastAndroid.show("You're now a developer!", ToastAndroid.LONG)
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
    <SettingSwitchComponent name={"Survey completed"}
                            sKey={"surveyCompleted"} />
    <SettingComponent name={"App opened times"}
                      sKey={"appOpenedTimes"}
                      onPress={(setValue) => setValue(0)} />
  </>;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl onRefresh={reloadSettings}
                                      refreshing={isReloading} />}>

      <ConfirmationModal isOpen={confirmModalMessage !== undefined}
                         onClose={() => confirmModalCallbackWrapper(false)}
                         onConfirm={() => confirmModalCallbackWrapper(true)}>
        <Text>{confirmModalMessage}</Text>
      </ConfirmationModal>

      <SettingSwitchComponent name={"Show advanced settings"}
                              value={showAdvancedSettings}
                              lessObviousStyling={true}
                              onPress={(setValue, sKey, newValue) => {
                                setValue(newValue);
                                setShowAdvancedSettings(newValue);
                                increaseEasterEggDevMode();
                              }} />

      {isReloading ? null : <>
        <Header title={"Display"} />
        <SettingComponent name={"Songs scale"}
                          sKey={"songScale"}
                          onPress={(setValue) => setValue(1)}
                          valueRender={(it) => {
                            if (it === 1.0) {
                              return "100 %";
                            }
                            return Math.round(it * 100) + " % (press to reset)";
                          }} />
        <SettingSwitchComponent name={"Keep screen on"}
                                sKey={"keepScreenAwake"} />
        <SettingSwitchComponent name={"Animated scrolling"}
                                sKey={"animateScrolling"}
                                isVisible={showAdvancedSettings} />
        <SettingSwitchComponent name={"Animate song loading"}
                                sKey={"songFadeIn"}
                                isVisible={showAdvancedSettings} />
        <SettingSwitchComponent name={"\"Jump to next verse\" button"}
                                sKey={"showJumpToNextVerseButton"}
                                isVisible={showAdvancedSettings} />
        <SettingSwitchComponent name={"Use native list component for song verses"}
                                sKey={"useNativeFlatList"}
                                isVisible={showAdvancedSettings} />
        <SettingSwitchComponent name={"Display song list size badge"}
                                sKey={"showSongListCountBadge"}
                                isVisible={showAdvancedSettings} />

        <Header title={"Backend"} isVisible={showAdvancedSettings} />
        <SettingSwitchComponent name={"Use authentication with backend"}
                                sKey={"useAuthentication"}
                                isVisible={showAdvancedSettings} />
        <SettingComponent name={"Authentication status with backend"}
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
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
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
