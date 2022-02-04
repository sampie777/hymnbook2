import { AbcConfig } from "../../../components/melody/voiceItems/config";
import { VoiceItemNote } from "./abcjsTypes";

export namespace AbcGui {
  export const calculateNoteWidth = (note: VoiceItemNote): number => {
    let result = AbcConfig.noteWidth + 2 * AbcConfig.notePadding;
    if (note.pitches?.some(it => it.accidental !== undefined)) {
      result += AbcConfig.accidentalWidth;
    }
    if (note.duration > 0.25) {
      result += note.duration * 8 * AbcConfig.noteWidth;
    }
    return result;
  };
}
