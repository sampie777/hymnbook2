import { Verse, VerseProps } from "./models/Songs";


export type ParamList = {
  Home: undefined,
  Settings: undefined,
  About: undefined,
  PrivacyPolicy: undefined,
  OtherMenu: undefined,

  SongImport: undefined,
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
    songListIndex?: number,
  },

  DocumentImport: undefined,
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

  SongImport: "Databases" as keyof ParamList,
  SongSearch: "Search songs" as keyof ParamList,
  SongList: "SongList" as keyof ParamList,
  Song: "Song" as keyof ParamList,
  VersePicker: "VersePicker" as keyof ParamList,

  DocumentImport: "Document databases" as keyof ParamList,
  DocumentSearch: "Documents" as keyof ParamList,
  Document: "Document" as keyof ParamList,
};
