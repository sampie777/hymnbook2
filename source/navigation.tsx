import { Verse, VerseProps } from "./logic/db/models/Songs";
import { Types } from "./gui/screens/downloads/TypeSelectBar";

export enum VersePickerMethod {
  UpdatePossibleSongListAndGoBackToSong,
  ShowSong,
  AddToSongListAndShowSearch,
}

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
export const VersePickerRoute = "VersePicker";
export const DocumentSearchRoute = "DocumentSearch";
export const DocumentRoute = "Document";

export type ParamList = {
  Home: undefined,
  Settings: undefined,
  About: undefined,
  PrivacyPolicy: undefined,
  OtherMenu: undefined,
  Databases: {
    type?: Types
  },

  SongSearch: undefined,
  SongStringSearchRoute: undefined,
  SongList: undefined,
  Song: {
    id?: number;
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
    highlightText?: string;
  },

  DocumentSearch: undefined,
  Document: {
    id: number;
  },
}
