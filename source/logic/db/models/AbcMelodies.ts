import Db from "../db";
import config from "../../../config";
import { AbcMelodySchema, AbcSubMelodySchema } from "./AbcMelodiesSchema";
import { VerseProps } from "./Songs";

export class AbcSubMelody {
  id: number;
  melody: string = "";
  uuid: string = "";
  parentUuid: string;

  constructor(
    melody: string = "",
    uuid: string,
    parentUuid: string,
    id = Db.songs.getIncrementedPrimaryKey(AbcSubMelodySchema)
  ) {
    this.id = id;
    this.melody = melody;
    this.uuid = uuid;
    this.parentUuid = parentUuid;
  }

  static getForVerse(melody: AbcMelody, verse: VerseProps): AbcSubMelody | undefined {
    return verse.abcMelodies.find(it => it.parentUuid === melody.uuid)
  }

  static toObject(obj: AbcSubMelody): AbcSubMelody {
    return {
      id: obj.id,
      melody: obj.melody,
      uuid: obj.uuid,
      parentUuid: obj.parentUuid
    }
  }
}

export class AbcMelody {
  id: number;
  name: string = config.defaultMelodyName;
  melody: string = "";
  uuid: string = "";

  constructor(
    name: string = config.defaultMelodyName,
    melody: string = "",
    uuid: string = "",
    id = Db.songs.getIncrementedPrimaryKey(AbcMelodySchema)
  ) {
    this.id = id;
    this.name = name;
    this.melody = melody;
    this.uuid = uuid;
  }
}
