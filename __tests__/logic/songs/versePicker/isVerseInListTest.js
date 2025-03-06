import { isVerseInList } from "../../../../source/logic/songs/versePicker";
import { Verse } from "../../../../source/logic/db/models/songs/Songs";
import { mockDb } from "../../../testUtils";

jest.mock("hymnbook2/source/logic/db/db");
mockDb();

describe("test isVerseInList function", () => {
  const verses = [
    new Verse(1, "Verse 2", "", "", "", null, 0),
    new Verse(3, "Verse 4", "", "", "", null, 1),
    new Verse(5, "Verse 6", "", "", "", null, 2),
  ];

  it("finds verse in list", () => {
    expect(isVerseInList(verses, verses[0])).toBe(true);
    expect(isVerseInList(verses, new Verse(3, "Verse 4", "", "", "", null, 1))).toBe(true);
    expect(isVerseInList(verses, new Verse(0, "Verse X", "", "", "", null, 1))).toBe(true);
  });

  it("finds no verse in list", () => {
    expect(isVerseInList(verses, new Verse(3, "Verse 4", "", "", "", null, 10))).toBe(false);
    expect(isVerseInList(verses, new Verse(0, "Verse X", "", "", "", null, 10))).toBe(false);
  });

  it("finds no verse in empty list", () => {
    expect(isVerseInList([], new Verse(3, "Verse 4", "", "", "", null, 10))).toBe(false);
  });
});
