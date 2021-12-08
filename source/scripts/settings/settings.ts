import { AccessRequestStatus } from "../server/models";
import { SettingsBaseClass } from "./settingsBase";

class SettingsClass extends SettingsBaseClass {
  // System
  keepScreenAwake = true;
  appOpenedTimes = 0;
  theme = "";

  // Search
  maxSearchInputLength = 3;
  maxSearchResultsLength = 40;
  clearSearchAfterAddedToSongList = true;

  // Songs
  songScale = 1.0;
  animateScrolling = true;
  songFadeIn = true;
  showJumpToNextVerseButton = true;
  showSongListCountBadge = true;
  useNativeFlatList = false;
  coloredVerseTitles = Math.random() > 0.5;
  highlightSelectedVerses = true;

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
