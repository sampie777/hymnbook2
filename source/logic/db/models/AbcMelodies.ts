import Db from "../db";
import { AbcMelodySchema, AbcSubMelodySchema } from "./AbcMelodiesSchema";
import { Verse, VerseProps } from "./Songs";

export class AbcSubMelody {
  id: number;
  melody: string = "";
  verse: Verse;

  constructor(
    melody: string = "",
    verse: Verse,
    id = Db.songs.getIncrementedPrimaryKey(AbcSubMelodySchema),
  ) {
    this.id = id;
    this.melody = melody;
    this.verse = verse;
  }

  static getForVerse(melody: AbcMelody, verse: VerseProps): AbcSubMelody | undefined {
    return melody.subMelodies.find(it => it.verse.id === verse.id)
  }
}

export class AbcMelody {
  id: number;
  name: string = "Default";
  melody: string = "";
  subMelodies: AbcSubMelody[];

  constructor(
    name: string = "Default",
    melody: string = "",
    subMelodies: AbcSubMelody[],
    id = Db.songs.getIncrementedPrimaryKey(AbcMelodySchema),
  ) {
    this.id = id;
    this.name = name;
    this.melody = melody;
    this.subMelodies = subMelodies;
  }
}
