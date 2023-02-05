import Db from "../db/db";
import { Song } from "../db/models/Songs";
import { SongSchema } from "../db/models/SongsSchema";
import { InterruptedError } from "../utils";

export namespace SongSearch {
  const titleMatchPoints = 2;
  const verseMatchPoints = 1;

  export interface SearchResult {
    song: Song;
    points: number;
    isTitleMatch: boolean;
    isVerseMatch: boolean;
  }

  export const find = (text: string, searchInTitles: boolean, searchInVerses: boolean, shouldCancel?: () => boolean): SearchResult[] => {
    const results: SearchResult[] = [];

    if (searchInTitles) {
      findByTitle(text).forEach(it => {
        results.push({
          song: it,
          points: calculateMatchPointsForTitleMatch(it, text),
          isTitleMatch: true,
          isVerseMatch: false
        });
      });
    }

    if (shouldCancel?.()) throw new InterruptedError();

    // Add verse results to results
    if (searchInVerses) {
      findByVerse(text).forEach((it) => {
        if (shouldCancel?.()) throw new InterruptedError();

        const existingResult = results.find(result => result.song.id === it.id);

        // Most time-consuming part: calculating how much the match is worth
        const points = calculateMatchPointsForVerseMatch(it, text);

        if (existingResult != null) {
          existingResult.points += points;
          existingResult.isVerseMatch = true;
        } else {
          results.push({
            song: it,
            points: points,
            isTitleMatch: false,
            isVerseMatch: true
          });
        }
      });
    }

    return results;
  };

  export const findByTitle = (text: string): Song[] => {
    const query = `name LIKE[c] "*${text}*"`;

    const results = Db.songs.realm().objects<Song>(SongSchema.name)
      .sorted("name")
      .sorted("number")
      .filtered(query);

    return Array.from(results);
  };

  export const findByVerse = (text: string): Song[] => {
    const query = `verses.content LIKE[c] "*${text}*"`;

    const results = Db.songs.realm().objects<Song>(SongSchema.name)
      .sorted("name")
      .sorted("number")
      .filtered(query);

    return Array.from(results);
  };

  export const calculateMatchPointsForTitleMatch = (song: Song, text: string): number => {
    return titleMatchPoints;
  };

  export const calculateMatchPointsForVerseMatch = (song: Song, text: string): number => {
    let result = 0;

    const totalContent = song.verses.reduce((result, it) => result + "\n" + it.content, "");

    const matches = totalContent.match(new RegExp(text, "gi"));
    if (matches != null) {
      result += matches.length * verseMatchPoints;
    }

    const totalVerseLines: number = totalContent.split("\n").length;

    if (totalVerseLines == 0) return 0;
    return result / totalVerseLines;
  };
}
