import React from "react";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import VerseSummary from "./VerseSummary";

interface Props {
  song: Song;
  searchText: string;
}

const MatchedVersesSummary: React.FC<Props> = ({ song, searchText }) => {
  const getFirstMatchIndex = (verse: Verse): number =>
    verse.content.split("\n")
      .findIndex(it => (new RegExp(searchText, "i")).test(it));

  const matchedVerses = song.verses
    .filter(it => (new RegExp(searchText, "i")).test(it.content));
  const visibleVerses = matchedVerses.length === 0 && song.verses.length > 0 ? [song.verses[0]] : matchedVerses;

  return <>
    {visibleVerses.map(it => <VerseSummary key={it.id}
                                           verse={it}
                                           preferredStartLine={Math.max(0, getFirstMatchIndex(it))}
                                           maxLines={2}
                                           searchText={searchText} />)
    }
  </>;
};

export default MatchedVersesSummary;
