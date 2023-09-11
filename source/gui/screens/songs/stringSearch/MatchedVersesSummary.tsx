import React from "react";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import { SongSearch } from "../../../../logic/songs/songSearch";
import VerseSummary from "./VerseSummary";

interface Props {
  song: Song;
  searchRegex: string;
}

const MatchedVersesSummary: React.FC<Props> = ({ song, searchRegex }) => {
  const getFirstMatchIndex = (verse: Verse): number =>
    verse.content.split("\n")
      .findIndex(it => (new RegExp(searchRegex, "i")).test(it));

  const matchedVerses = SongSearch.getMatchedVerses(song, searchRegex);
  const visibleVerses = matchedVerses.length === 0 && song.verses.length > 0 ? [song.verses[0]] : matchedVerses;

  return <>
    {visibleVerses.map(it => <VerseSummary key={it.uuid}
                                           verse={it}
                                           preferredStartLine={Math.max(0, getFirstMatchIndex(it))}
                                           maxLines={2}
                                           searchText={searchRegex} />)
    }
  </>;
};

export default MatchedVersesSummary;
