import { Verse } from "./models/Songs";

export const routes = {
  Home: "Home",
  Search: "Search",
  SongList: "SongList",
  Import: "Databases",
  Settings: "Settings",
  About: "About",
  PrivacyPolicy: "Privacy policy",
  Song: "Song",
  VersePicker: "VersePicker"
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
