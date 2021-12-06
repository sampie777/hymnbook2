import { Verse } from "./models/Songs";

export const routes = {
  Home: "Home",
  Search: "Search",
  SongList: "SongList",
  ImportSongs: "Databases",
  ImportDocuments: "Document databases",
  Settings: "Settings",
  About: "About",
  PrivacyPolicy: "Privacy policy",
  Song: "Song",
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
