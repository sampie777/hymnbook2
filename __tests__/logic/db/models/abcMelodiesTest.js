import { AbcMelody, AbcSubMelody } from "../../../../source/logic/db/models/AbcMelodies";
import { Verse } from "../../../../source/logic/db/models/Songs";

describe("abc melodies models", () => {
  it("return sub melody for verse", () => {
    const subMelody1 = new AbcSubMelody("", "", "abcMelody1", 0);
    const subMelody2 = new AbcSubMelody("", "", "abcMelody1", 1);
    const subMelody3 = new AbcSubMelody("", "", "abcMelody2", 2);
    const abcMelody1 = new AbcMelody("", "", "abcMelody1",0);
    const abcMelody2 = new AbcMelody("", "", "abcMelody2", 0);
    const verse1 = new Verse(0, "", "", "", "", 0, "", [subMelody1]);
    const verse2 = new Verse(1, "", "", "", "", 1, "", [subMelody2, subMelody3]);
    const verse3 = new Verse(2, "", "", "", "", 2, "", []);


    expect(AbcSubMelody.getForVerse(abcMelody1, verse1)).toBe(subMelody1);
    expect(AbcSubMelody.getForVerse(abcMelody1, verse2)).toBe(subMelody2);
    expect(AbcSubMelody.getForVerse(abcMelody1, verse3)).toBe(undefined);

    expect(AbcSubMelody.getForVerse(abcMelody2, verse1)).toBe(undefined);
    expect(AbcSubMelody.getForVerse(abcMelody2, verse2)).toBe(subMelody3);
    expect(AbcSubMelody.getForVerse(abcMelody2, verse3)).toBe(undefined);
  });
});
