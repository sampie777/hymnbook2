import React, { MutableRefObject, useRef, useState } from "react";
import Settings from "../../../settings";
import { ServerAuth } from "../../../logic/server/auth";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import { AccessRequestStatus } from "../../../logic/server/models";
import { rollbar } from "../../../logic/rollbar";
import { Analytics } from "../../../logic/analytics";
import { SongSearch } from "../../../logic/songs/songSearch";
import { capitalize, format, isAndroid } from "../../../logic/utils";
import { Security } from "../../../logic/security";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { useAppContext } from "../../components/providers/AppContextProvider";
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { SettingComponent } from "./components/SettingComponent";
import SettingSwitchComponent from "./components/SettingSwitchComponent";
import SettingsSliderComponent from "./components/SettingsSliderComponent";

const Header: React.FC<{ title: string, isVisible?: boolean }> = ({ title, isVisible = true }) => {
  const styles = createStyles(useTheme());
  return !isVisible ? null : <Text style={styles.settingHeader}>{title}</Text>;
};

const SettingsScreen: React.FC = () => {
  const confirmModalCallback: MutableRefObject<((isConfirmed: boolean) => void) | undefined> =
    useRef(undefined);
  const [confirmModalMessage, setConfirmModalMessage] = useState<string | undefined>(undefined);
  const [isReloading, setReloading] = useState(false);
  const [easterEggEnableDevModeCount, setEasterEggEnableDevModeCount] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showDocumentsZoomSettings, setShowDocumentsZoomSettings] = useState(Settings.documentsUseExperimentalViewer);

  const appContext = useAppContext();
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
    Analytics.uploadSettings();
  };

  const reloadSettings = () => {
    setReloading(true);
    setTimeout(() => setReloading(false), 100);
  };

  const increaseEasterEggDevMode = () => {
    if (appContext.developerMode) {
      return;
    }

    setEasterEggEnableDevModeCount(easterEggEnableDevModeCount + 1);
    if (easterEggEnableDevModeCount >= 9) {
      appContext.setDeveloperMode(true);
      rollbar.info("Someone switched on developer mode", {
        deviceId: ServerAuth.getDeviceId(),
        appOpenedTimes: Settings.appOpenedTimes
      });
      if (isAndroid) {
        ToastAndroid.show("You're now a developer!", ToastAndroid.LONG);
      }
    }
  };

  function getAuthenticationStateAsMessage() {
    if (ServerAuth.isAuthenticated()) {
      return "Authenticated";
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
    <SettingSwitchComponent title={"Tutorial completed"}
                            onLongPress={(setValue) => setValue(false)}
                            keyName={"tutorialCompleted"} />
    <SettingSwitchComponent title={"Survey completed"}
                            onLongPress={(setValue) => setValue(false)}
                            keyName={"surveyCompleted"} />
    <SettingSwitchComponent title={"Track song audio downloads"}
                            onLongPress={(setValue) => setValue(true)}
                            keyName={"trackDownloads"} />
    <SettingComponent title={"Last update timestamp"}
                      description={"Timestamp of list time the app checked for database updates"}
                      onLongPress={(setValue) => setValue(0)}
                      valueRender={value => format(new Date(value), "%H:%MM:%SS %d-%m-%YYYY")}
                      keyName={"autoUpdateDatabasesLastCheckTimestamp"} />
    <SettingComponent title={"App opened times"}
                      keyName={"appOpenedTimes"}
                      onLongPress={(setValue) => setValue(0)} />
    <SettingComponent title={"Melody showed times"}
                      keyName={"melodyShowedTimes"}
                      onLongPress={(setValue) => setValue(0)} />
    <SettingComponent title={"App user ID"}
                      description={"This secure ID is used for analytic purposes, such as crash logs."}
                      value={Security.getDeviceId()} />
    <SettingComponent title={"Backend user ID"}
                      description={"This ID is used for authentication with our online database."}
                      keyName={"authClientName"} />
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
          <SettingComponent title={"Theme"}
                            keyName={"theme"}
                            description={"Tap here to switch between dark en light mode."}
                            onPress={(setValue) => {
                              let newValue = "";
                              if (Settings.theme === "")
                                newValue = "dark";
                              if (Settings.theme === "dark")
                                newValue = "light";

                              setValue(newValue);
                              theme.reload();
                            }}
                            onLongPress={(setValue) => setValue("")}  // Set default
                            valueRender={it => {
                              if (it === "") {
                                return "System (auto)";
                              }
                              return capitalize(it);
                            }} />
          <SettingSwitchComponent title={"Keep screen on"}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"keepScreenAwake"}
                                  isVisible={showAdvancedSettings} />

          <Header title={"Songs"} />
          <SettingsSliderComponent title={"Song text size"}
                                   keyName={"songScale"}
                                   valueRender={(it) => Math.round(it * 100) + " %"}
                                   defaultValue={1.0} />
          <SettingComponent<SongSearch.StringSearchButtonPlacement>
            title={"Search button location"}
            keyName={"stringSearchButtonPlacement"}
            description={"Tap here to change the location of the song search button."}
            onPress={(setValue) => {
              const keys = Object.keys(SongSearch.StringSearchButtonPlacement);
              const currentIndex = keys.indexOf(Settings.stringSearchButtonPlacement);
              const newValue = keys[(currentIndex + 1) % keys.length];
              setValue(newValue);
            }}
            onLongPress={(setValue) => setValue(SongSearch.StringSearchButtonPlacement.BottomRight)}  // Set default
            valueRender={(it) => {
              switch (it) {
                case SongSearch.StringSearchButtonPlacement.TopLeft:
                  return "Top left";
                case SongSearch.StringSearchButtonPlacement.BottomRight:
                  return "Bottom right";
                case SongSearch.StringSearchButtonPlacement.BottomLeft:
                  return "Bottom left";
                default:
                  return "Unknown";
              }
            }} />
          <SettingSwitchComponent title={"Use colored verse numbers"}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"coloredVerseTitles"} />
          <SettingSwitchComponent title={"Highlight selected verses"}
                                  description={"Give verse titles an accent when selected."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"highlightSelectedVerses"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Remember previous song"}
                                  description={"Show the previous viewed song number in the search screen."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"songSearchRememberPreviousEntry"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Clear search after adding/viewing a song"}
                                  description={"Don't keep the previous search in the search screen."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"clearSearchAfterAddedToSongList"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Animate scrolling"}
                                  description={"Disable this if scrolling isn't performing smooth."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"animateScrolling"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Animate song loading"}
                                  description={"Use fade-in effect when showing a song. Useful for e-ink displays. Restart might be required."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"songFadeIn"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"'Jump to next verse' button"}
                                  description={"Show this button in the bottom right corner."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"showJumpToNextVerseButton"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Use native list component for song verses and documents"}
                                  description={"Try to toggle this if pinch-to-zoom or scrolling glitches."}
                                  onLongPress={(setValue) => setValue(Platform.OS === "ios")}
                                  keyName={"useNativeFlatList"}
                                  isVisible={showAdvancedSettings} />

          <Header title={"Song melody"} isVisible={showAdvancedSettings} />
          <SettingsSliderComponent title={"Song melody size"}
                                   keyName={"songMelodyScale"}
                                   description={"The size of the melody notes relative to the size of the text."}
                                   isVisible={showAdvancedSettings}
                                   valueRender={(it) => Math.round(it * 100) + " %"}
                                   defaultValue={1.0} />
          <SettingSwitchComponent title={"Show melody for all verses (experimental)"}
                                  description={"Show melody for all verses instead of the first (selected) verse. This may result in reduces performance."}
                                  onLongPress={(setValue) => setValue(false)}
                                  keyName={"showMelodyForAllVerses"}
                                  isVisible={showAdvancedSettings} />

          <Header title={"Documents"}
                  isVisible={showDocumentsZoomSettings || showAdvancedSettings} />
          <SettingSwitchComponent title={"Enable zoom (experimental)"}
                                  description={"Use the experimental document viewer, which can be zoomed in/out. Let us know if you see something wrong."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"documentsUseExperimentalViewer"}
                                  onPress={((setValue, key, newValue) => {
                                    setValue(newValue);
                                    setShowDocumentsZoomSettings(newValue);
                                  })}
                                  isVisible={showAdvancedSettings} />
          <SettingsSliderComponent title={"Document text size"}
                                   keyName={"documentScale"}
                                   valueRender={(it) => Math.round(it * 100) + " %"}
                                   defaultValue={1.0}
                                   isVisible={showDocumentsZoomSettings} />
          <SettingSwitchComponent title={"Multi keyword search for documents"}
                                  description={"When enabled, each keyword will be matched individually instead of " +
                                    "the whole search phrase. This will yield more results."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"documentsMultiKeywordSearch"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Reset search path"}
                                  description={"After viewing a document, start browsing from the upper root instead of from where you left."}
                                  onLongPress={(setValue) => setValue(false)}
                                  keyName={"documentsResetPathToRoot"}
                                  isVisible={showAdvancedSettings} />

          <Header title={"Other"} />
          <SettingComponent
            title={"Auto update databases"}
            keyName={"autoUpdateDatabasesCheckIntervalInDays"}
            description={"Tap here to change or disable the auto updating frequency of the song and document databases."}
            onPress={(setValue) => {
              // Only allow the 'once a day' mode for developers, to not overload the backend servers
              if (Settings.autoUpdateDatabasesCheckIntervalInDays < 1 && appContext.developerMode) setValue(1);
              else if (Settings.autoUpdateDatabasesCheckIntervalInDays < 7) setValue(7);
              else if (Settings.autoUpdateDatabasesCheckIntervalInDays < 30) setValue(30);
              else setValue(0);
            }}
            onLongPress={(setValue) => setValue(7)}  // Set default
            valueRender={(it) => {
              const value = +it;
              if (value <= 0) return "Never";
              if (value == 1) return "Once a day";
              if (value == 7) return "Once a week";
              if (value == 30) return "Once a month";
              return `Every ${value} days`;
            }} />
          <SettingSwitchComponent title={"Auto update databases over WiFi only"}
                                  description={"Disable this to also allow mobile data to be used for auto updates."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"autoUpdateOverWifiOnly"} />
          <SettingSwitchComponent title={"Enable text selection"}
                                  description={"Enable this to be able to select and copy text from songs and documents."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"enableTextSelection"}
                                  isVisible={showAdvancedSettings} />
          <SettingSwitchComponent title={"Share usage data"}
                                  description={"Help us improve this app based on how you use the app, by sharing this app's settings with us."}
                                  onLongPress={(setValue) => setValue(true)}
                                  keyName={"shareUsageData"} />

          <Header title={"Backend"} isVisible={showAdvancedSettings} />
          <SettingComponent title={"Authentication status with backend"}
                            value={authenticationStatus}
                            isVisible={showAdvancedSettings}
                            valueRender={(it) => {
                              if (Settings.authStatus === AccessRequestStatus.UNKNOWN) {
                                return it;
                              }
                              return it + " (hold to reset)";
                            }}
                            onLongPress={(setValue) =>
                              setConfirmModalCallback(
                                "Reset/forget authentication?",
                                (isConfirmed) => {
                                  if (isConfirmed) {
                                    ServerAuth.forgetCredentials();
                                  }
                                  setValue(getAuthenticationStateAsMessage());
                                })} />

          {!appContext.developerMode ? undefined : developerSettings}

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
