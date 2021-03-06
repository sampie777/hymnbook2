import { Platform } from "react-native";
import { AccessRequestStatus } from "./logic/server/models";
import { SettingsBaseClass } from "./logic/settings/settingsBase";

class SettingsClass extends SettingsBaseClass {
  // System
  keepScreenAwake = true;
  appOpenedTimes = 0;
  theme = "";

  // Song search
  clearSearchAfterAddedToSongList = true;

  // Songs
  songScale = 1.0;
  songMelodyScale = 1.0;
  animateScrolling = true;
  songFadeIn = true;
  showJumpToNextVerseButton = true;
  showSongListCountBadge = true;
  useNativeFlatList = Platform.OS === "ios";
  coloredVerseTitles = Math.random() > 0.5;
  highlightSelectedVerses = true;
  showMelody = false;
  showMelodyForAllVerses = false;
  animateAddedToSongList = true;

  // Documents
  enableDocumentsFeatureSwitch = false;
  documentsMultiKeywordSearch = true;

  // Server authentication
  useAuthentication = true;
  authClientName = "";
  authRequestId = "";
  authJwt = "";
  authStatus = AccessRequestStatus.UNKNOWN;
  authDeniedReason = "";

  // Survey
  surveyCompleted = false;
}

const Settings = new SettingsClass();
export default Settings;
