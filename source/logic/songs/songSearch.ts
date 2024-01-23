import Db from "../db/db";
import { Song, SongMetadataType, Verse } from "../db/models/Songs";
import { SongSchema } from "../db/models/SongsSchema";
import { InterruptedError } from "../InterruptedError";

export namespace SongSearch {
  export const titleMatchPoints = 2;
  export const alternativeTitleMatchPoints = 1.9;
  export const verseMatchPoints = 1;

  export interface SearchResult {
    song: Song;
    points: number;
    isTitleMatch: boolean;
    isMetadataMatch: boolean;
    isVerseMatch: boolean;
  }

  export enum StringSearchButtonPlacement {
    TopLeft = 0,
    TopRight,
    BottomRight,
    BottomLeft,
    Length
  }

  export enum OrderBy {
    Relevance = "Relevance",
    SongBundle = "SongBundle",
  }

  export const find = (text: string,
                       searchInTitles: boolean,
                       searchInVerses: boolean,
                       selectedBundleUuids: string[],
                       shouldCancel?: () => boolean): SearchResult[] => {
    const results: SearchResult[] = [];

    if (searchInTitles) {
      findByTitle(text, selectedBundleUuids).forEach(it => {
        const points = calculateMatchPointsForTitleMatch(it, text);
        results.push({
          song: it,
          points: points,
          isTitleMatch: points === titleMatchPoints,
          isMetadataMatch: points !== titleMatchPoints,
          isVerseMatch: false
        });
      });
    }

    if (shouldCancel?.()) throw new InterruptedError();

    // Add verse results to results
    if (searchInVerses) {
      findByVerse(text, selectedBundleUuids).forEach((it) => {
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
            isMetadataMatch: false,
            isVerseMatch: true
          });
        }
      });
    }

    return results;
  };

  const createSongBundleFilterQuery = (selectedBundleUuids: string[]) => `ANY _songBundles.uuid in {${selectedBundleUuids.map(it => `'${it}'`).join(", ")}}`;

  export const findByTitle = (text: string, selectedBundleUuids: string[] = []): Song[] => {
    const metadataQuery = `SUBQUERY(metadata, $it, $it.type = "${SongMetadataType.AlternativeTitle}" AND $it.value LIKE[c] "*${text}*").@count > 0`;
    const songBundleQuery = selectedBundleUuids.length == 0 ? ""
      : `AND ${createSongBundleFilterQuery(selectedBundleUuids)}`;
    const query = `(name LIKE[c] "*${text}*" OR ${metadataQuery}) ${songBundleQuery}`;

    const results = Db.songs.realm().objects<Song>(SongSchema.name)
      .sorted("name")
      .sorted("number")
      .filtered(query);

    return Array.from(results);
  };

  export const findByVerse = (text: string, selectedBundleUuids: string[] = []): Song[] => {
    let query = `verses.content LIKE[c] $0`;
    const args: any[] = [`*${text}*`];

    // Add wildcards to ignore some punctuation (max 1 at the moment)
    // ("ab, cd" will match "ab cd")
    if (/ .+/.test(text)) {
      for (let i = 0; i < text.length; i++) {
        if (text[i] != " ") continue;
        const regex = text.slice(0, i) + "?" + text.slice(i);
        query += ` or verses.content LIKE[c] $${args.length}`;
        args.push(`*${regex}*`);
      }
    }

    if (selectedBundleUuids.length > 0) {
      query = `(${query}) AND ${createSongBundleFilterQuery(selectedBundleUuids)}`;
    }

    const results = Db.songs.realm().objects<Song>(SongSchema.name)
      .sorted("name")
      .sorted("number")
      .filtered(query, ...args);

    return Array.from(results);
  };

  /**
   * A main title match returns full points. An alternative title match slightly less.
   * @param song
   * @param text
   */
  export const calculateMatchPointsForTitleMatch = (song: Song, text: string): number => {
    const regexText = makeSearchTextRegexable(text);
    if (RegExp(regexText, "i").test(song.name))
      return titleMatchPoints;
    return alternativeTitleMatchPoints;
  };

  export const calculateMatchPointsForVerseMatch = (song: Song, text: string): number => {
    let result = 0;

    const totalContent = song.verses.reduce((result, it) => result + "\n" + it.content, "");

    const regexText = makeSearchTextRegexable(text);
    const matches = totalContent.match(new RegExp(regexText, "gi"));
    if (matches != null) {
      result += matches.length * verseMatchPoints;
    }

    const totalVerseLines: number = totalContent.split("\n").length;

    if (totalVerseLines == 0) return 0;
    return result / totalVerseLines;
  };

  export const getMatchedVerses = (song: Song, text: string): Verse[] => {
    return song.verses.filter(it => (new RegExp(text, "i")).test(it.content));
  };

  export const makeSearchTextRegexable = (text: string): string => text
    .replace(/([.\[\](){}+$^!])/g, "\\$1") // Escape all illegal characters
    .replace(/\?/g, ".?")  // Allow user to use "?" as wildcard
    .replace(/\*/g, ".*")  // Allow user to use "*" as wildcard
    .replace(/(.+?) (.+?)/g, "$1.? $2");  // Allow for matching over punctuation ("ab, cd" will match "ab cd")

  export const sort = (results: SongSearch.SearchResult[], order: OrderBy): SongSearch.SearchResult[] => {
    switch (order) {
      case SongSearch.OrderBy.Relevance:
        return results.sort((a, b) => b.points - a.points);
      case SongSearch.OrderBy.SongBundle:
        return results
          .sort((a, b) => a.song.name.localeCompare(b.song.name))
          .sort((a, b) => (a.song.number ?? 0) - (b.song.number ?? 0))
          .sort((a, b) => (Song.getSongBundle(a.song)?.name ?? "").localeCompare(Song.getSongBundle(b.song)?.name ?? ""));
    }
    return results;
  };
}
