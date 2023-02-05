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
      .findIndex(it => it.toLowerCase().includes(searchText.toLowerCase()));  // This is faster then .match()

  return <>
    {song.verses
      .filter(it => it.content.toLowerCase().includes(searchText.toLowerCase()))
      .map(it => {
        return <VerseSummary key={it.id}
                             verse={it}
                             preferredStartLine={getFirstMatchIndex(it)}
                             maxLines={2}
                             searchText={searchText} />;
      })
    }
  </>;
};

export default MatchedVersesSummary;
