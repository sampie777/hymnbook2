import { Platform } from "react-native";
import { AccessRequestStatus } from "./logic/server/models";
import { SettingsBaseClass } from "./logic/settings/settingsBase";
import { SongSearch } from "./logic/songs/songSearch";

class SettingsClass extends SettingsBaseClass {
  // System
  keepScreenAwake = true;
  appOpenedTimes = 0;
  theme = "";
  enableTextSelection = true;

  // Song search
  clearSearchAfterAddedToSongList = true;
  stringSearchButtonPlacement = SongSearch.StringSearchButtonPlacement.BottomRight;
  songSearchInTitles = true;
  songSearchInVerses = true;
  songSearchRememberPreviousEntry = true;

  // Songs
  songScale = 1.0;
  songMelodyScale = 1.0;
  animateScrolling = true;
  songFadeIn = true;
  showJumpToNextVerseButton = true;
  showSongListCountBadge = true;
  useNativeFlatList = Platform.OS === "ios";
  coloredVerseTitles = true;
  highlightSelectedVerses = true;
  animateAddedToSongList = true;
  showMelodyForAllVerses = false;
  melodyShowedTimes = 0;

  // Songs audio
  songAudioPlaybackSpeed = 1.0;
  trackDownloads = process.env.NODE_ENV !== "development";

  // Documents
  documentsMultiKeywordSearch = true;
  documentScale = 1.0;
  documentsUseExperimentalViewer = true;
  documentsResetPathToRoot = false;

  // Server authentication
  authClientName = "";
  authRequestId = "";
  authJwt = "";
  authStatus = AccessRequestStatus.UNKNOWN;
  authDeniedReason = "";

  // Survey
  surveyCompleted = false;

  // Other
  shareUsageData = process.env.NODE_ENV !== "development";
}

const Settings = new SettingsClass();
export default Settings;
