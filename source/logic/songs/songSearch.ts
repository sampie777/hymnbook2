import Db from "../db/db";
import { Song } from "../db/models/Songs";
import { SongSchema } from "../db/models/SongsSchema";

export namespace SongSearch {
  const titleMatchPoints = 2;
  const verseMatchPoints = 1;

  export interface SearchResult {
    song: Song;
    points: number;
  }

  export const find = (text: string, searchInTitles: boolean, searchInVerses: boolean): SearchResult[] => {
    const results: SearchResult[] = [];

    if (searchInTitles) {
      findByTitle(text).forEach(it => {
        results.push({
          song: it,
          points: calculateMatchPointsForTitleMatch(it, text)
        });
      });
    }

    // Add verse results to results
    if (searchInVerses) {
      findByVerse(text).forEach(it => {
        const existingResult = results.find(result => result.song.id === it.id);

        const points = calculateMatchPointsForVerseMatch(it, text);

        if (existingResult != null) {
          existingResult.points += points;
        } else {
          results.push({
            song: it,
            points: points
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

    song.verses.forEach(it => {
      const matches = it.content.match(new RegExp(text, "gi"));
      if (matches == null) return;
      result += matches.length * verseMatchPoints;
    });

    const totalVerseLines: number = song.verses
      .reduce((result, it) =>
        result + it.content.split("\n").length, 0);

    return result / totalVerseLines;
  };

  export const versesContainWord = (song: Song, text: string): boolean =>
    song.verses.some(it => it.content.match(new RegExp(text, "gi")));
}
