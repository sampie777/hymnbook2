import { isVerseInList } from "../../../../source/logic/songs/versePicker";
import { Verse } from "../../../../source/logic/db/models/Songs";

describe("test isVerseInList function", () => {
  const verses = [
    new Verse(1, "Verse 2", "", "", "", 0),
    new Verse(3, "Verse 4", "", "", "", 1),
    new Verse(5, "Verse 6", "", "", "", 2),
  ];

  it("finds verse in list", () => {
    expect(isVerseInList(verses, verses[0])).toBe(true);
    expect(isVerseInList(verses, new Verse(3, "Verse 4", "", "", "", 1))).toBe(true);
    expect(isVerseInList(verses, new Verse(0, "Verse X", "", "", "", 1))).toBe(true);
  });

  it("finds no verse in list", () => {
    expect(isVerseInList(verses, new Verse(3, "Verse 4", "", "", "", 10))).toBe(false);
    expect(isVerseInList(verses, new Verse(0, "Verse X", "", "", "", 10))).toBe(false);
  });

  it("finds no verse in empty list", () => {
    expect(isVerseInList([], new Verse(3, "Verse 4", "", "", "", 10))).toBe(false);
  });
});
