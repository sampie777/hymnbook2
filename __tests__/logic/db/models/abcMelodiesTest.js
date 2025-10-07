import {describe, expect, it, jest} from '@jest/globals';
import {AbcMelody, AbcSubMelody} from "../../../../source/logic/db/models/songs/AbcMelodies";
import {Verse} from "../../../../source/logic/db/models/songs/Songs";
import {mockDb} from "../../../testUtils";

jest.mock("hymnbook2/source/logic/db/db");
mockDb();

describe("abc melodies models", () => {
  it("return sub melody for verse", () => {
    const subMelody1 = new AbcSubMelody("", "", "", ["verse1"]);
    const subMelody2 = new AbcSubMelody("", "", "", ["verse2"]);
    const subMelody3 = new AbcSubMelody("", "", "", ["verse1", "verse2"]);
    const abcMelody1 = new AbcMelody("", "", "",[subMelody1, subMelody2]);
    const abcMelody2 = new AbcMelody("", "", "", [subMelody3]);
    const verse1 = new Verse(0, "", "", "", "verse1", "");
    const verse2 = new Verse(1, "", "", "", "verse2", "");
    const verse3 = new Verse(2, "", "", "", "verse3", "");


    expect(AbcSubMelody.getForVerse(abcMelody1, verse1)).toBe(subMelody1);
    expect(AbcSubMelody.getForVerse(abcMelody1, verse2)).toBe(subMelody2);
    expect(AbcSubMelody.getForVerse(abcMelody1, verse3)).toBe(undefined);

    expect(AbcSubMelody.getForVerse(abcMelody2, verse1)).toBe(subMelody3);
    expect(AbcSubMelody.getForVerse(abcMelody2, verse2)).toBe(subMelody3);
    expect(AbcSubMelody.getForVerse(abcMelody2, verse3)).toBe(undefined);
  });
});
