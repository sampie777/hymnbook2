import { AbcMelody, AbcSubMelody } from "../../../../source/logic/db/models/AbcMelodies";
import { Verse } from "../../../../source/logic/db/models/Songs";
import { ABC } from "../../../../source/logic/songs/abc/abc";
import { mockDb } from "../../../testUtils";

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

    expect(ABC.generateAbcForVerse(verse, abcMelody)).toBe("123\n456\nw: abc def")
  });

  it("returns sub melody if available with lyrics", () => {
    const subMelody = new AbcSubMelody("111\n222", "", "", ["verse"]);
    const abcMelody = new AbcMelody("", "123\n456", "", [subMelody]);
    const verse = new Verse(0, "", "", "", "verse", "abc\ndef");

    expect(ABC.generateAbcForVerse(verse, abcMelody)).toBe("111\n222\nw: abc def")
  });
});
