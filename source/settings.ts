import { Platform } from "react-native";
import { AccessRequestStatus } from "./logic/server/models";
import { SettingsBaseClass } from "./logic/settings/settingsBase";
import { SongSearch } from "./logic/songs/songSearch";

class SettingsClass extends SettingsBaseClass {
  // System
  keepScreenAwake = true;
  appOpenedTimes = 0;
  theme = "";

  // Song search
  clearSearchAfterAddedToSongList = true;
  stringSearchButtonPlacement = SongSearch.StringSearchButtonPlacement.BottomRight;
  songSearchInTitles = true;
  songSearchInVerses = true;

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
  animateAddedToSongList = true;
  showMelody = Platform.OS === "android";
  showMelodyForAllVerses = false;
  longPressForMelodyMenu = true;
  melodyShowedTimes = 0;

  // Documents
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

  // Other
  shareUsageData = true;
}

const Settings = new SettingsClass();
export default Settings;
