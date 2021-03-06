import { Verse, VerseProps } from "./logic/db/models/Songs";
import { Types } from "./gui/screens/downloads/TypeSelectBar";

export enum VersePickerMethod {
  UpdatePossibleSongListAndGoBackToSong,
  ShowSong,
  AddToSongListAndShowSearch,
}

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
  SongList: undefined,
  Song: {
    id?: number;
    songListIndex?: number;
    selectedVerses?: Verse[];
  },
  VersePicker: {
    verses: Verse[],
    selectedVerses: VerseProps[],
    method: VersePickerMethod
    songListIndex?: number, // Not used when method=ShowSong|AddToSongListAndShowSearch, otherwise still optional
    songId?: number;  // Required when method=ShowSong|AddToSongListAndShowSearch
  },

  DocumentSearch: undefined,
  Document: {
    id: number;
  },
}

export const routes = {
  Home: "Home" as keyof ParamList,
  Settings: "Settings" as keyof ParamList,
  About: "About" as keyof ParamList,
  PrivacyPolicy: "Privacy policy" as keyof ParamList,
  OtherMenu: "More" as keyof ParamList,
  Databases: "Databases" as keyof ParamList,

  SongSearch: "Songs" as keyof ParamList,
  SongList: "Song list" as keyof ParamList,
  Song: "Song" as keyof ParamList,
  VersePicker: "VersePicker" as keyof ParamList,

  DocumentSearch: "Documents" as keyof ParamList,
  Document: "Document" as keyof ParamList
};
