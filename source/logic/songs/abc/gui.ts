import { AbcConfig } from "../../../gui/components/melody/config";
import { VoiceItemNote } from "@hymnbook/abc";
import Settings from "../../../settings.ts";

export namespace AbcGui {
  export const calculateNoteWidth = (note: VoiceItemNote): number => {
    if (note.rest !== undefined && note.rest.type === "spacer") {
      return note.duration * 8 * AbcConfig.spacerWidth;
    }

    let result = AbcConfig.noteWidth + 2 * AbcConfig.notePadding;
    if (note.pitches?.some(it => it.accidental !== undefined)) {
      result += AbcConfig.accidentalWidth;
    }
    if (note.duration > 0.5) {
      result += note.duration * 4 * AbcConfig.noteWidth;
    }
    if (note.rest) {
      result += note.duration * (Settings.showMelodyOnSeparateLines ? 2 : 8) * AbcConfig.noteWidth
    }
    return result;
  };
}
