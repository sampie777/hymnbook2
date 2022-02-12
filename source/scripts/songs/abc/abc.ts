import * as ABCJS from "abcjs";
import { AbcClef, KeySignature, TuneObject, VoiceItem, VoiceItemNote } from "./abcjsTypes";
import { validate } from "../../utils";
import { Verse } from "../../../models/Songs";

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
    abc = abc.replace(/%.*/, "");

    const song = new Song();
    abc = extractInfoFields(abc, song);

    const { notes, lyrics } = extractNotesAndLyrics(abc);
    const convertedAbc =
      (song.voice === undefined ? "" : "V:" + song.voice + "\n") +
      (song.key === undefined ? "" : "K:" + song.key + "\n") +
      notes + "\n" +
      "w: " + lyrics;

    const tuneObject = ABC.convertStringToAbcTune(
      convertedAbc);
    if (tuneObject === undefined) {
      return undefined;
    }

    song.melody = tuneObject.lines!![0].staff!![0].voices!![0];
    song.clef = tuneObject.lines!![0].staff!![0].clef || song.clef;
    song.keySignature = tuneObject.lines!![0].staff!![0].key || song.keySignature;

    return song;
  };

  export const getField = (abc: string, field: string): (string | undefined) => {
    const result = abc.match(new RegExp(field + ":(.*)?"));
    if (result == null || result.length !== 2) {
      return undefined;
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
    song.referenceNumber = getField(abc, "X");
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
    return "X:1\n" +
      melody + "\n" +
      "w: " + verse.abcLyrics?.replace(/\n/g, " ");
  };
}
