import { Verse } from "./models/Songs";

export const routes = {
  Home: "Home",
  SongSearch: "Search songs",
  DocumentSearch: "Search documents",
  SongList: "SongList",
  SongImport: "Databases",
  DocumentImport: "Document databases",
  Settings: "Settings",
  About: "About",
  PrivacyPolicy: "Privacy policy",
  Song: "Song",
  Document: "Document",
  VersePicker: "VersePicker",
  OtherMenu: "More"
};


export interface SongRouteParams {
  id: number;
  songListIndex?: number;
  selectedVerses?: Array<Verse>;
}

export interface VersePickerRouteParams {
  verses: Array<Verse>;
  selectedVerses?: Array<Verse>;
  songListIndex?: number;
}

export interface DocumentRouteParams {
  id: number;
}
