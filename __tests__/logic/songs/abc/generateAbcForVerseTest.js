import {describe, expect, it, jest} from '@jest/globals';
import {AbcMelody, AbcSubMelody} from "../../../../source/logic/db/models/songs/AbcMelodies";
import {Verse} from "../../../../source/logic/db/models/songs/Songs";
import {ABC} from "../../../../source/logic/songs/abc/abc";
import {mockDb} from "../../../testUtils";

jest.mock("hymnbook2/source/logic/db/db");
mockDb();

describe("abc generates abc for verse", () => {
  it("returns empty string if there is no melody", () => {
    const verse = new Verse(0, "", "", "", "", "abc\ndef");

    expect(ABC.generateAbcForVerse(verse, undefined)).toBe("")
  });

  it("returns default melody with lyrics", () => {
    const abcMelody = new AbcMelody("", "123\n456");
    const verse = new Verse(0, "", "", "", "", "abc\ndef");

    expect(ABC.generateAbcForVerse(verse, abcMelody)).toBe("X:1\n123\nw: abc\n456\nw: def")
  });

  it("returns sub melody if available with lyrics", () => {
    const subMelody = new AbcSubMelody("111\n222", "", "", ["verse"]);
    const abcMelody = new AbcMelody("", "123\n456", "", [subMelody]);
    const verse = new Verse(0, "", "", "", "verse", "abc\ndef");

    expect(ABC.generateAbcForVerse(verse, abcMelody)).toBe("X:1\n111\nw: abc\n222\nw: def")
  });

  it("returns melody with lyrics and extra notes if there are more lyrics than notes", () => {
    const abcMelody = new AbcMelody("", "123\n456");
    const verse = new Verse(0, "", "", "", "", "abc\ndef\nghi");

    expect(ABC.generateAbcForVerse(verse, abcMelody)).toBe("X:1\n123\nw: abc\n456\nw: def\nC C C C C C C C C C \nw: ghi")
  });

  it("returns melody with lyrics and extra notes without their lyrics", () => {
    const abcMelody = new AbcMelody("", "123\n456\n789");
    const verse = new Verse(0, "", "", "", "", "abc\ndef");

    expect(ABC.generateAbcForVerse(verse, abcMelody)).toBe("X:1\n123\nw: abc\n456\nw: def\n789")
  });
});
