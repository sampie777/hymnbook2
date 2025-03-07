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
  songSearchSortOrder = SongSearch.OrderBy.Relevance;
  songSearchSelectedBundlesUuids: string[] = [];
  songStringSearchSelectedBundlesUuids: string[] = [];
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

  // Updates
  autoUpdateDatabasesCheckIntervalInDays = 7;
  autoUpdateDatabasesLastCheckTimestamp = 0;
  autoUpdateOverWifiOnly = true;

  // Other
  surveyCompleted = false;
  tutorialCompleted = false;
  shareUsageData = process.env.NODE_ENV !== "development";
  debug_addWhitespaceAfterEachVerseLine = false;
  debug_renderEachVerseLineAsTextComponent = false;
  debug_useAnimatedTextComponentForVerse = true;
  debug_useAnimatedTextComponentForExtraComponents = true;
  debug_addWhitespacesAfterVerse = false;
  debug_addInvisibleCharactersAfterVerse = false;
  debug_addInvisibleTextAfterVerse = false;
  debug_adjustsFontSizeToFit = false;
  debug_allowFontScaling = true;
  debug_logOnTextLayout = false;
  debug_drawSongVerseBorders = false;
  debug_ignoreShowMelody = false;
  debug_maxVerseWidth = false;
  debug_mediumVerseWidth = false;
  debug_removeClippedSubviews = false;
  debug_alwaysCalculateVerseHeight = false;
  debug_useFlexForVerses = false;
  debug_useFlexForVersesContent = false;

  debug_drawSongVerseBorderOpaque = false;
  debug_drawSongVerseBorderContainer = false;
  debug_drawSongVerseBorderTitle = false;
  debug_drawSongVerseBorderText = false;
  debug_drawSongVerseBorderVerseList = false;
  debug_verseWidth = 1.0;
  debug_zoomFactor = 1.0;
  debug_verseHeightCalculationReturnsZero = false;
  debug_neverCalculateVerseHeight = false;
  debug_letterSpacing = 0.0;
  debug_includeFontPadding = true;
}

const Settings = new SettingsClass();
export default Settings;
