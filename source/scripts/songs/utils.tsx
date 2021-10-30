import { Song, Verse, VerseProps } from "../../models/Songs";

export enum VerseType {
  Verse,
  Chorus,
  Bridge,
  Intro,
  End,
}

export const getVerseType = (verse: Verse): VerseType => {
  if (verse.name.match(/chorus\W?/gi)) {
    return VerseType.Chorus;
  }
  if (verse.name.match(/bridge\W?/gi)) {
    return VerseType.Bridge;
  }
  if (verse.name.match(/intro\W?/gi)) {
    return VerseType.Intro;
  }
  if (verse.name.match(/end\W?/gi)) {
    return VerseType.End;
  }

  return VerseType.Verse;
};

export const generateSongTitle = (song?: Song, selectedVerses?: Array<Verse>): string => {
  if (song === undefined) {
    return "";
  }

  if (selectedVerses === undefined || selectedVerses.length === 0) {
    return song.name;
  }

  return song.name + ": "
    + (selectedVerses as Array<VerseProps>)
      .filter(it => it.name.toLowerCase().includes("verse"))
      .map(it => it.name.replace(/verse */gi, ""))
      .join(", ");
};
