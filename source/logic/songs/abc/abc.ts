import * as ABCJS from "abcjs";
import { AbcClef, KeySignature, TuneObject, VoiceItem, VoiceItemNote } from "./abcjsTypes";
import { validate } from "../../utils";
import { Verse } from "../../db/models/Songs";

// See also https://abcnotation.com/examples

export namespace ABC {
  export class Song {
    // See also: https://abcnotation.com/wiki/abc:standard:v2.1#information_fields
    area?: string;
    book?: string;
    composer?: string;
    discography?: string;
    fileUrl?: string;
    group?: string;
    history?: string;
    instruction?: string;
    key?: string;
    unitNoteLength?: string;
    meter?: string;
    macro?: string;
    notes?: string;
    origin?: string;
    parts?: string;
    tempo?: string;
    rhythm?: string;
    remark?: string;
    source?: string;
    symbolLine?: string;
    title?: string;
    userDefined?: string;
    voice?: string;
    referenceNumber?: string;
    transcription?: string;
    melody: VoiceItem[] = [];
    clef: AbcClef = {
      clefPos: 4,
      type: "treble",
      verticalPos: 0
    };
    keySignature: KeySignature = {
      accidentals: [],
      root: "C",
      acc: "",
      mode: ""
    };
  }

  export interface NoteGroupInterface {
    notes: string,
    lyrics: string
  }

  export const parse = (abc: string): Song | undefined => {
    // Remove comments
    abc = abc.replace(/%.*/g, "");

    const song = new Song();
    abc = extractInfoFields(abc, song);

    const { notes, lyrics } = extractNotesAndLyrics(abc);
    const abcMelodyOneLiner = notes + "\n" + "w: " + lyrics;

    const convertedAbc = addInfoFieldsToMelody(song, abcMelodyOneLiner);
    const tuneObject = ABC.convertStringToAbcTune(convertedAbc);
    if (tuneObject === undefined) {
      return undefined;
    }

    song.melody = tuneObject.lines!![0].staff!![0].voices!![0];
    song.clef = tuneObject.lines!![0].staff!![0].clef || song.clef;
    song.keySignature = tuneObject.lines!![0].staff!![0].key || song.keySignature;

    return song;
  };

  export const getField = (abc: string, field: string, _default?: string): (string | undefined) => {
    const result = abc.match(new RegExp(field + ":(.*)?"));
    if (result == null || result.length !== 2) {
      return _default;
    }
    return result[1].trim();
  };

  const extractInfoFields = (abc: string, song: Song): string => {
    song.area = getField(abc, "A");
    song.book = getField(abc, "B");
    song.composer = getField(abc, "C");
    song.discography = getField(abc, "D");
    song.fileUrl = getField(abc, "F");
    song.group = getField(abc, "G");
    song.history = getField(abc, "H");
    song.instruction = getField(abc, "I");
    song.key = getField(abc, "K");
    song.unitNoteLength = getField(abc, "L");
    song.meter = getField(abc, "M");
    song.macro = getField(abc, "m");
    song.notes = getField(abc, "N");
    song.origin = getField(abc, "O");
    song.parts = getField(abc, "P");
    song.tempo = getField(abc, "Q");
    song.rhythm = getField(abc, "R");
    song.remark = getField(abc, "r");
    song.source = getField(abc, "S");
    song.symbolLine = getField(abc, "s");
    song.title = getField(abc, "T");
    song.userDefined = getField(abc, "U");
    song.voice = getField(abc, "V");
    song.referenceNumber = getField(abc, "X", "1");
    song.transcription = getField(abc, "Z");
    return abc
      .replace(/[ABCDFGHIKLMmNOPQRrSsTUVXZ]:.*/g, "")
      .replace(/\n+/g, "\n")
      .replace(/^\n*/g, "")
      .replace(/\n*$/g, "");
  };

  export const extractNotesAndLyrics = (abc: string): NoteGroupInterface => {
    const notes: string[] = [];
    const lyrics: string[] = [];
    abc.split("\n")
      .map(it => it.trim())
      .forEach(it => {
        if (it.startsWith("w:") || it.startsWith("W:")) {
          lyrics.push(it.substr(2).trim());
        } else {
          notes.push(it);
        }
      });

    return {
      notes: notes.join(" "),
      lyrics: lyrics.join(" ")
    } as NoteGroupInterface;
  };

  export const addInfoFieldsToMelody = (song: Song, abc: string): string => {
    let result = "";
    // See for following order of fields: https://abcnotation.com/wiki/abc:standard:v2.1#description_of_information_fields
    result += song.referenceNumber === undefined ? "" : "X:" + song.referenceNumber + "\n";
    result += song.title === undefined ? "" : "T:" + song.title + "\n";
    result += song.area === undefined ? "" : "A:" + song.area + "\n";
    result += song.book === undefined ? "" : "B:" + song.book + "\n";
    result += song.composer === undefined ? "" : "C:" + song.composer + "\n";
    result += song.discography === undefined ? "" : "D:" + song.discography + "\n";
    result += song.fileUrl === undefined ? "" : "F:" + song.fileUrl + "\n";
    result += song.group === undefined ? "" : "G:" + song.group + "\n";
    result += song.history === undefined ? "" : "H:" + song.history + "\n";
    result += song.instruction === undefined ? "" : "I:" + song.instruction + "\n";
    result += song.key === undefined ? "" : "K:" + song.key + "\n";
    result += song.unitNoteLength === undefined ? "" : "L:" + song.unitNoteLength + "\n";
    result += song.meter === undefined ? "" : "M:" + song.meter + "\n";
    result += song.macro === undefined ? "" : "m:" + song.macro + "\n";
    result += song.notes === undefined ? "" : "N:" + song.notes + "\n";
    result += song.origin === undefined ? "" : "O:" + song.origin + "\n";
    result += song.parts === undefined ? "" : "P:" + song.parts + "\n";
    result += song.tempo === undefined ? "" : "Q:" + song.tempo + "\n";
    result += song.rhythm === undefined ? "" : "R:" + song.rhythm + "\n";
    result += song.remark === undefined ? "" : "r:" + song.remark + "\n";
    result += song.source === undefined ? "" : "S:" + song.source + "\n";
    result += song.symbolLine === undefined ? "" : "s:" + song.symbolLine + "\n";
    result += song.userDefined === undefined ? "" : "U:" + song.userDefined + "\n";
    result += song.voice === undefined ? "" : "V:" + song.voice + "\n";
    result += song.transcription === undefined ? "" : "Z:" + song.transcription + "\n";
    return result + abc;
  };

  export const convertStringToAbcTune = (abc: string): TuneObject | undefined => {
    // @ts-ignore
    const object: Array<TuneObject> = ABCJS.parseOnly(abc);

    try {
      validate(object != null, "Tune object may not be null");
      validate(object.length > 0, "Tune object may not be empty");
      validate(object[0].lines != null, "Tune object lines may not be null");
      validate(object[0].lines.length > 0, "Tune object lines are empty");
      validate(object[0].lines[0].staff != null, "Staffs may not be null");
      validate(object[0].lines[0].staff!!.length > 0, "Staffs are empty");
      validate(object[0].lines[0].staff!![0].voices != null, "Voices may not be null");
      validate(object[0].lines[0].staff!![0].voices!!.length > 0, "Voices may not be empty");
      validate(object[0].lines[0].staff!![0].voices!!.some(it => it.length > 0), "Voices are all empty");
    } catch (e) {
      console.warn(e);
      return undefined;
    }

    processAbcLyrics(object);

    return object[0];
  };

  const processAbcLyrics = (object: Array<TuneObject>) => {
    object[0].lines!!.forEach(line =>
      line.staff!!.forEach(staff =>
        staff.voices!!.forEach(element =>
          element.filter(voice => voice.el_type === "note")
            .map(voice => voice as VoiceItemNote)
            .forEach(voice => {
              voice.lyric?.forEach(lyric =>
                lyric.syllable = lyric.syllable.replace(" ", " ")
              );
            })
        )
      )
    );
  };

  export const generateAbcForVerse = (verse: Verse, backupMelody?: string): string => {
    const melody = verse.abcMelody || backupMelody;
    return melody + "\n" + "w: " + verse.abcLyrics?.replace(/\n/g, " ");
  };
}
