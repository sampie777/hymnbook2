import { useEffect, useRef } from "react";
import { Song, Verse } from "../../db/models/Songs";
import config from "../../../config";
import { SongHistoryController } from "./songHistoryController";

const useHistory = (
  song: Song | undefined,
  viewIndex: number,
  selectedVerses: Verse[] = [],
) => {
  const previousSong = useRef<Song | undefined>(undefined);
  const previousIndex = useRef<number>(-1);
  const startTime = useRef<Date>(new Date());

  useEffect(() => {
    console.log(song?.verses[viewIndex]?.name);
    checkViewTime();
    previousSong.current = song ? Song.clone(song, {includeVerses: true}) : undefined;
    previousIndex.current = viewIndex;
    if (song == undefined) return;

    return () => checkViewTime();
  }, [viewIndex, song?.uuid]);

  useEffect(() =>  () => checkViewTime(), []);

  const checkViewTime = () => {
    const currentPreviousSong = previousSong.current;

    // We just opened a song
    if (previousIndex.current == undefined && song != undefined) startTime.current = new Date();

    // Check for valid objects
    if (currentPreviousSong == undefined) return;
    if (previousIndex.current < 0) return;

    // Check for changes
    if (song?.uuid == currentPreviousSong.uuid && viewIndex == previousIndex.current) return;

    const endTime = new Date();
    const difference = endTime.getTime() - startTime.current.getTime();
    startTime.current = new Date();

    if (difference < config.songs.history.minViewTimeMs) return;

    const verse = currentPreviousSong.verses[previousIndex.current];
    SongHistoryController.pushVerse(verse, currentPreviousSong, difference);
  }
};

export default useHistory;
