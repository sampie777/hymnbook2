import { Verse, VerseProps } from "./logic/db/models/songs/Songs";
import { Types } from "./gui/screens/downloads/TypeSelectBar";

export enum VersePickerMethod {
  UpdatePossibleSongListAndGoBackToSong,
  ShowSong,
  AddToSongListAndShowSearch,
}

export const TutorialRoute = "TutorialRoute";
export const OrganizationsOnboardingRoute = "OrganizationsOnboardingRoute";
export const HomeRoute = "Home";
export const SettingsRoute = "Settings";
export const AboutRoute = "About";
export const PrivacyPolicyRoute = "PrivacyPolicy";
export const OtherMenuRoute = "OtherMenu";
export const DatabasesRoute = "Databases";
export const SongSearchRoute = "SongSearch";
export const SongListRoute = "SongList";
export const SongRoute = "Song";
export const SongStringSearchRoute = "SongStringSearchRoute";
export const SongHistoryRoute = "SongHistoryRoute";
export const VersePickerRoute = "VersePicker";
export const DocumentSearchRoute = "DocumentSearch";
export const DocumentRoute = "Document";
export const DocumentHistoryRoute = "DocumentHistoryRoute";

export type ParamList = {
  TutorialRoute: undefined,
  OrganizationsOnboardingRoute: undefined,
  Home: undefined,
  Settings: undefined,
  About: undefined,
  PrivacyPolicy: undefined,
  OtherMenu: undefined,
  Databases: {
    type?: Types,
    promptForUuid?: string;
  },

  SongSearch: undefined,
  SongStringSearchRoute: undefined,
  SongHistoryRoute: undefined,
  SongList: undefined,
  Song: {
    id?: number;
    uuid?: string;
    songListIndex?: number;
    selectedVerses?: Verse[];
    highlightText?: string;
  },
  VersePicker: {
    verses: Verse[],
    selectedVerses: VerseProps[],
    method: VersePickerMethod
    songListIndex?: number, // Not used when method=ShowSong|AddToSongListAndShowSearch, otherwise still optional
    songId?: number;  // Required when method=ShowSong|AddToSongListAndShowSearch
    songUuid?: string;  // Required when method=ShowSong|AddToSongListAndShowSearch
    songName?: string;
    highlightText?: string;
  },

  DocumentSearch: undefined,
  Document: {
    id?: number;
    uuid?: string;
  },
  DocumentHistoryRoute: undefined,
}
