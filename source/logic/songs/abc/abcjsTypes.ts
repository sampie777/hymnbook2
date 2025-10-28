// See also: https://github.com/paulrosen/abcjs/blob/2616d88ddf0222e255c508f944df3089960c13dc/types/index.d.ts

import { SynthOptions } from "abcjs";

export type AccidentalName = "flat" | "natural" | "sharp" | "dblsharp" | "dblflat" | "quarterflat" | "quartersharp";
export type ChordPlacement = "above" | "below" | "left" | "right" | "default";
export type StemDirection = "up" | "down" | "auto" | "none";
export type AbcType =
  "bar_thin"
  | "bar_thin_thick"
  | "bar_thin_thin"
  | "bar_thick_thin"
  | "bar_right_repeat"
  | "bar_left_repeat"
  | "bar_double_repeat";
export type AbcElementType = "note" | "bar";
export type Clef =
  "treble"
  | "tenor"
  | "bass"
  | "alto"
  | "treble+8"
  | "tenor+8"
  | "bass+8"
  | "alto+8"
  | "treble-8"
  | "tenor-8"
  | "bass-8"
  | "alto-8"
  | "none"
  | "perc";
export type NoteHeadType = "normal" | "harmonic" | "rhythm" | "x" | "triangle";
export type NoteLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "a" | "b" | "c" | "d" | "e" | "f" | "g";
export type KeyRoot = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "HP" | "Hp" | "none";
export type KeyAccidentalName = "" | "#" | "b";
export type Mode = "" | "m" | "Dor" | "Mix" | "Loc" | "Phr" | "Lyd";
export type ChordType =
  ""
  | "m"
  | "7"
  | "m7"
  | "maj7"
  | "M7"
  | "6"
  | "m6"
  | "aug"
  | "+"
  | "aug7"
  | "dim"
  | "dim7"
  | "9"
  |
  "m9"
  | "maj9"
  | "M9"
  | "11"
  | "dim9"
  | "sus"
  | "sus9"
  | "7sus4"
  | "7sus9"
  | "5";
export type BracePosition = "start" | "continue" | "end";

type NumberFunction = () => number;

export interface AbcChord {
  name: string;
  position: ChordPlacement;
}

export interface AbcPitchStartSlur {
  label: number; // An identifier for this slur in the current slur sequence (if there are more than one slurs for this note)
}

export interface AbcPitch {
  pitch: number;
  verticalPos: number;
  name?: string;
  accidental?: AccidentalName;
  startTie?: {};
  endTie?: boolean;
  startSlur?: AbcPitchStartSlur[];
  endSlur?: number[]; // An array of slur identifiers which should end here
}

export interface AbcRest {
  type: "rest" | "whole" | "multimeasure" | "spacer";
  text?: number;
}

export interface AbcLyric {
  syllable: string;
  divider: " " | "-" | "_";
}

export interface VoiceItemBar {
  el_type: "bar";
  type: AbcType;
  startChar: number;
  endChar: number;
}

export interface NoteProperties {
  duration: number;
  pitches?: AbcPitch[];
  lyric?: AbcLyric[];
  chord?: AbcChord[];
  rest?: AbcRest;
}

export interface VoiceItemNote extends NoteProperties {
  el_type: "note";
  startChar: number;
  endChar: number;
}

export interface VoiceItemStem {
  el_type: "stem";
  direction: StemDirection;
}

export interface VoiceItemClef {
  el_type: "clef";
  stafflines?: number;
  staffscale?: number;
  transpose?: number;
  type: Clef;
  verticalPos: number;
  clefPos?: number;
  startChar: number;
  endChar: number;
}

export interface VoiceItemGap {
  el_type: "gap";
  gap: number;
}

export interface VoiceItemKey extends KeySignature {
  el_type: "key";
  startChar: number;
  endChar: number;
}

export type VoiceItem = VoiceItemClef | VoiceItemBar | VoiceItemGap | VoiceItemKey | VoiceItemStem | VoiceItemNote;

export interface Accidental {
  acc: AccidentalName;
  note: NoteLetter;
  verticalPos: number;
}

export interface AbcClef {
  clefPos: number;
  type: Clef;
  verticalPos: number;
}

export interface KeySignature {
  accidentals?: Array<Accidental>;
  root: KeyRoot;
  acc: KeyAccidentalName;
  mode: Mode;
}

export interface AbcStaff {
  barNumber?: number;
  brace: BracePosition;
  bracket: BracePosition;
  connectBarLines: BracePosition;
  stafflines?: number;
  clef?: AbcClef;
  key?: KeySignature;
  voices?: Array<Array<VoiceItem>>;
}

export interface AbcLine {
  staff?: AbcStaff[];
}

export interface MetaText {
  "abc-copyright"?: string;
  "abc-creator"?: string;
  "abc-version"?: string;
  "abc-charset"?: string;
  "abc-edited-by"?: string;
  author?: string;
  book?: string;
  composer?: string;
  discography?: string;
  footer?: {
    left: string;
    center: string;
    right: string;
  };
  group?: string;
  header?: {
    left: string;
    center: string;
    right: string;
  };
  history?: string;
  instruction?: string;
  measurebox?: boolean;
  notes?: string;
  origin?: string;
  partOrder?: string;
  rhythm?: string;
  source?: string;
  textBlock?: string;
  title?: string;
  transcription?: string;
  url?: string;
}

export interface TuneObject {
  formatting: object;
  media: string;
  version: string;
  metaText: MetaText;
  lines: AbcLine[];

  getTotalTime: NumberFunction;
  getTotalBeats: NumberFunction;
  getBarLength: NumberFunction;
  getBeatLength: NumberFunction;
  getBeatsPerMeasure: NumberFunction;
  getBpm: NumberFunction;
  getPickupLength: NumberFunction;
  getKeySignature: () => KeySignature;
  getElementFromChar: (charPos: number) => VoiceItem | null;
  millisecondsPerMeasure: NumberFunction;
  lineBreaks?: Array<number>;
  visualTranspose?: number;
  setUpAudio: (options?: SynthOptions) => AudioTracks;
}

export interface AudioTracks {
  tempo: number;
  instrument: number;
  tracks: AudioTrack[][];
  totalDuration: number;
}

export type AudioTrack = AudioTrackProgram | AudioTrackText | AudioTrackNote;

export interface AudioTrackProgram {
  cmd: "program";
  channel: number;
}

export interface AudioTrackText {
  cmd: "text";
  // ...?
}

export interface AudioTrackNote {
  cmd: "note";
  duration: number;
  volume: number;
  pitch: number;
  gap: number;
  instrument: number;
  start: number;
  startChar: number;
  endChar: number;
}
