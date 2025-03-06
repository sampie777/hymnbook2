import Db from "../db";
import { SongHistorySchema } from "./SongHistorySchema";

export enum SongHistoryAction {
  ScrolledDown = "ScrolledDown",
  ScrolledUp = "ScrolledUp",
  // UseNextVerseButton = "UseNextVerseButton",
  // OpenedOnSelectedVerse = "OpenedOnSelectedVerse",
  OpenedSong = "OpenedSong",
  Unknown = "Unknown",
}

export class SongHistory {
  id: number;
  bundleUuid: string;
  bundleName: string;
  songUuid: string;
  songName: string;
  verseUuid: string;
  verseName: string;
  verseIndex: number;
  timestamp: Date;
  viewDurationMs: number;
  action: SongHistoryAction;

  constructor(
    bundleUuid: string,
    bundleName: string,
    songUuid: string,
    songName: string = "",
    verseUuid: string = "",
    verseName: string = "",
    verseIndex: number = -1,
    timestamp: Date = new Date(),
    viewDurationMs: number = 0,
    action: SongHistoryAction = SongHistoryAction.Unknown,
    id = Db.songs.getIncrementedPrimaryKey(SongHistorySchema)
  ) {
    this.id = id;
    this.bundleUuid = bundleUuid;
    this.bundleName = bundleName;
    this.songUuid = songUuid;
    this.songName = songName;
    this.verseUuid = verseUuid;
    this.verseName = verseName;
    this.verseIndex = verseIndex;
    this.timestamp = timestamp;
    this.viewDurationMs = viewDurationMs;
    this.action = action;
  }
}
