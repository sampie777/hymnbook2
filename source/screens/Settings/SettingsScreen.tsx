import React, { MutableRefObject, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import Settings from "../../scripts/settings";
import { ServerAuth } from "../../scripts/server/auth";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useFocusEffect } from "@react-navigation/native";
import { SettingComponent, SettingSwitchComponent } from "./SettingComponent" ;
import { AccessRequestStatus } from "../../scripts/server/models";

const Header: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.settingHeader}>{title}</Text>
);

const SettingsScreen: React.FC = () => {
  const confirmModalCallback: MutableRefObject<((isConfirmed: boolean) => void) | undefined> =
    useRef(undefined);
  const [confirmModalMessage, setConfirmModalMessage] = useState<string | undefined>(undefined);
  const [isReloading, setReloading] = useState(false);

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
      style={styles.container}
      refreshControl={<RefreshControl onRefresh={reloadSettings} refreshing={isReloading} />}>

      <ConfirmationModal isOpen={confirmModalMessage !== undefined}
                         onClose={() => confirmModalCallbackWrapper(false)}
                         onConfirm={() => confirmModalCallbackWrapper(true)}>
        <Text>{confirmModalMessage}</Text>
      </ConfirmationModal>

      {isReloading ? null : <>
        <Header title={"Layout"} />
        <SettingComponent name={"Songs scale"}
                          sKey={"songScale"}
                          onPress={(setValue) => setValue(1)}
                          valueRender={(it) => Math.round(it * 100) + " %"} />
        <SettingSwitchComponent name={"Keep screen on"}
                                sKey={"keepScreenAwake"} />
        <SettingSwitchComponent name={"Animated scrolling"}
                                sKey={"animateScrolling"} />
        <SettingSwitchComponent name={"Animate song loading"}
                                sKey={"songFadeIn"} />
        <SettingSwitchComponent name={"\"Jump to next verse\" button"}
                                sKey={"showJumpToNextVerseButton"} />

        <Header title={"Backend"} />
        <SettingSwitchComponent name={"Use authentication with backend"}
                                sKey={"useAuthentication"} />
        <SettingComponent name={"Authentication status with backend"}
                          value={authenticationStatus}
                          onPress={(setValue) =>
                            setConfirmModalCallback(
                              "Reset/forget authentication?",
                              (isConfirmed) => {
                                if (isConfirmed) {
                                  ServerAuth.forgetCredentials();
                                }
                                setValue(getAuthenticationStateAsMessage);
                              })} />

        {process.env.NODE_ENV !== "development" ? undefined : developerSettings}

      </>}
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {},

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
