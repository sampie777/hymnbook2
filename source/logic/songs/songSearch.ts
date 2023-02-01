import { Song } from "../db/models/Songs";
import Db from "../db/db";
import { SongSchema } from "../db/models/SongsSchema";
import config from "../../config";

export namespace SongSearch {
  export interface SearchResult {
    song: Song;
  }

  export const find = (text: string, searchInTitles: boolean, searchInVerses: boolean): SearchResult[] => {
    let query = "";
    if (searchInTitles) {
      query += `name LIKE "*${text}*"`;
    }
    if (searchInVerses) {
      // todo
    }

    query = query.trim()

    if (query.length === 0) {
      return [];
    }

    query += ` LIMIT(${config.maxSearchResultsLength})`;

    const results = Db.songs.realm().objects<Song>(SongSchema.name)
      .sorted("name")
      .filtered(query);

    return results.map(it => {
      return {
        song: it
      };
    });
  };
}
