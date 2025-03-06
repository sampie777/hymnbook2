import { useEffect, useRef } from "react";
import { Song } from "../../db/models/songs/Songs";
import config from "../../../config";
import { SongHistoryController } from "./songHistoryController";
import { SongHistoryAction } from "../../db/models/songs/SongHistory";

const useHistory = (
  song: Song | undefined = undefined,
  viewIndex: number = -1,
  action: SongHistoryAction,
) => {
  const previousSong = useRef<Song | undefined>(undefined);
  const previousIndex = useRef<number>(0);
  const previousAction = useRef<SongHistoryAction>(SongHistoryAction.Unknown);
  const nextAction = useRef<SongHistoryAction>(SongHistoryAction.Unknown);
  const startTime = useRef<Date | undefined>();

  useEffect(() => {
    checkViewTime();

    if (previousSong.current == undefined && song != undefined && viewIndex == 0) {
      setNextAction(SongHistoryAction.OpenedSong);
    } else if (previousSong.current != undefined && song != undefined && song.uuid == previousSong.current.uuid) {
      if (viewIndex > previousIndex.current)
        setNextAction(SongHistoryAction.ScrolledDown);
      else if (viewIndex < previousIndex.current)
        setNextAction(SongHistoryAction.ScrolledUp);
    } else if (song == undefined) {
      setNextAction(SongHistoryAction.Unknown);
    }

    // Update values
    previousSong.current = song ? Song.clone(song, { includeVerses: true }) : undefined;
    if (viewIndex != null && viewIndex >= 0) previousIndex.current = viewIndex;

    previousAction.current = nextAction.current;

    return () => checkViewTime();
  }, [viewIndex, song?.uuid]);

  const setNextAction = (it: SongHistoryAction) => {
    nextAction.current = it;
  };

  useEffect(() => {
    setNextAction(action);
  }, [action]);

  useEffect(() => () => checkViewTime(), []);

  const checkViewTime = () => {
    const currentPreviousSong = previousSong.current;

    if (startTime.current == undefined) {
      startTime.current = new Date();
      return;
    }

    const endTime = new Date();
    const difference = endTime.getTime() - startTime.current.getTime();
    if (song == undefined) startTime.current = undefined;

    // We just opened a song
    if (previousIndex.current == undefined && song != undefined) startTime.current = new Date();

    // Check for valid objects
    if (currentPreviousSong == undefined) return;
    if (previousIndex.current < 0) return;

    // Check for changes
    if (song?.uuid == currentPreviousSong.uuid && viewIndex == previousIndex.current) return;

    startTime.current = new Date();

    if (difference < config.songs.history.minViewTimeMs) return;

    const verse = currentPreviousSong.verses[previousIndex.current];
    SongHistoryController.pushVerse(verse, currentPreviousSong, difference, previousAction.current);
  }
};

export default useHistory;
