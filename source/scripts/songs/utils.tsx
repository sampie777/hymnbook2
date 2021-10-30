import { Verse } from "../../models/Songs";

export enum VerseType {
  Verse,
  Chorus,
  Bridge,
  Intro,
  End,
}

export const getVerseType = (verse: Verse): VerseType => {
  if (verse.name.match(/chorus\W?/gi)) {
    return VerseType.Chorus
  }
  if (verse.name.match(/bridge\W?/gi)) {
    return VerseType.Bridge
  }
  if (verse.name.match(/intro\W?/gi)) {
    return VerseType.Intro
  }
  if (verse.name.match(/end\W?/gi)) {
    return VerseType.End
  }

  return VerseType.Verse;
};
