import Db from "../db";
import config from "../../../config";
import { AbcMelodySchema, AbcSubMelodySchema } from "./AbcMelodiesSchema";
import { VerseProps } from "./Songs";

export class AbcSubMelody {
  id: number;
  uuid: string = "";
  name: string = "";
  melody: string = "";
  verseUuids: string[] = [];

  constructor(
    melody: string = "",
    name: string = "",
    uuid: string = "",
    verseUuids: string[] = [],
    id = Db.songs.getIncrementedPrimaryKey(AbcSubMelodySchema)
  ) {
    this.id = id;
    this.uuid = uuid;
    this.name = name;
    this.melody = melody;
    this.verseUuids = verseUuids;
  }

  static getForVerse(melody: AbcMelody, verse: VerseProps): AbcSubMelody | undefined {
    return melody.subMelodies.find(it =>
      // `.includes()` won't work due to the Realm data type of `verseUuids`.
      it.verseUuids.some(it => it == verse.uuid));
  }
}

export class AbcMelody {
  id: number;
  uuid: string = "";
  name: string = config.defaultMelodyName;
  melody: string = "";
  subMelodies: AbcSubMelody[];

  constructor(
    name: string = config.defaultMelodyName,
    melody: string = "",
    uuid: string = "",
    subMelodies: AbcSubMelody[] = [],
    id = Db.songs.getIncrementedPrimaryKey(AbcMelodySchema)
  ) {
    this.id = id;
    this.name = name;
    this.melody = melody;
    this.subMelodies = subMelodies;
    this.uuid = uuid;
  }
}
