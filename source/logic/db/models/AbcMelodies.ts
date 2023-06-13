import Db from "../db";
import config from "../../../config";
import { AbcMelodySchema, AbcSubMelodySchema } from "./AbcMelodiesSchema";
import { Verse, VerseProps } from "./Songs";

export class AbcSubMelody {
  id: number;
  melody: string = "";
  verse: Verse;
  uuid: string = "";

  constructor(
    melody: string = "",
    verse: Verse,
    uuid: string,
    id = Db.songs.getIncrementedPrimaryKey(AbcSubMelodySchema)
  ) {
    this.id = id;
    this.melody = melody;
    this.verse = verse;
    this.uuid = uuid;
  }

  static getForVerse(melody: AbcMelody, verse: VerseProps): AbcSubMelody | undefined {
    return melody.subMelodies.find(it => it.verse.id === verse.id);
  }
}

export class AbcMelody {
  id: number;
  name: string = config.defaultMelodyName;
  melody: string = "";
  uuid: string = "";
  subMelodies: AbcSubMelody[];

  constructor(
    name: string = config.defaultMelodyName,
    melody: string = "",
    uuid: string = "",
    subMelodies: AbcSubMelody[],
    id = Db.songs.getIncrementedPrimaryKey(AbcMelodySchema)
  ) {
    this.id = id;
    this.name = name;
    this.melody = melody;
    this.uuid = uuid;
    this.subMelodies = subMelodies;
  }
}
