import { AbcMelody, AbcSubMelody } from "../../../../source/logic/db/models/AbcMelodies";
import { Verse } from "../../../../source/logic/db/models/Songs";
import { ABC } from "../../../../source/logic/songs/abc/abc";

describe("abc generates abc for verse", () => {
  it("returns empty string if there is no melody", () => {
    const verse = new Verse(0, "", "", "", 0, "abc\ndef");

    expect(ABC.generateAbcForVerse(verse, undefined)).toBe("")
  });

  it("returns default melody with lyrics", () => {
    const abcMelody = new AbcMelody("", "123\n456", [], 0);
    const verse = new Verse(0, "", "", "", 0, "abc\ndef");

    expect(ABC.generateAbcForVerse(verse, abcMelody)).toBe("123\n456\nw: abc def")
  });

  it("returns sub melody if available with lyrics", () => {
    const verse = new Verse(0, "", "", "", 0, "abc\ndef");
    const subMelody = new AbcSubMelody("111\n222", verse, 0);
    const abcMelody = new AbcMelody("", "123\n456", [subMelody], 0);

    expect(ABC.generateAbcForVerse(verse, abcMelody)).toBe("111\n222\nw: abc def")
  });
});
