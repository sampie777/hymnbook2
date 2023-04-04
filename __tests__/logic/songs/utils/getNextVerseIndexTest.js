import { Verse } from "../../../../source/logic/db/models/Songs";
import { getNextVerseIndex } from "../../../../source/logic/songs/utils";

describe("test get next verse index", () => {
  it("returns -1 when current is < 0 aka end of list", () => {
    const currentIndex = -1;
    const verses = [
      new Verse(1, "Verse 2", "", "", "", 0),
      new Verse(3, "Verse 4", "", "", "", 0),
      new Verse(5, "Verse 6", "", "", "", 0),
    ];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(-1);
  });
  it("returns the first index when current is at the beginning of the list", () => {
    const currentIndex = 0;
    const verses = [
      new Verse(3, "Verse 4", "", "", "", 0),
      new Verse(5, "Verse 6", "", "", "", 0),
    ];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(3);
  });
  it("returns the first index when current is at the beginning of the list 2", () => {
    const currentIndex = 1;
    const verses = [
      new Verse(3, "Verse 4", "", "", "", 0),
      new Verse(5, "Verse 6", "", "", "", 0),
    ];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(3);
  });

  it("returns the next index", () => {
    const currentIndex = 0;
    const verses = [
      new Verse(0, "Verse 1", "", "", "", 0),
      new Verse(1, "Verse 2", "", "", "", 0),
      new Verse(3, "Verse 4", "", "", "", 0),
      new Verse(5, "Verse 6", "", "", "", 0),
    ];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(1);
  });
  it("returns the next index 2", () => {
    const currentIndex = 1;
    const verses = [
      new Verse(0, "Verse 1", "", "", "", 0),
      new Verse(1, "Verse 2", "", "", "", 0),
      new Verse(3, "Verse 4", "", "", "", 0),
      new Verse(5, "Verse 6", "", "", "", 0),
    ];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(3);
  });

  it("returns -1 when current is the last in the list", () => {
    const currentIndex = 5;
    const verses = [
      new Verse(0, "Verse 1", "", "", "", 0),
      new Verse(1, "Verse 2", "", "", "", 0),
      new Verse(3, "Verse 4", "", "", "", 0),
      new Verse(5, "Verse 6", "", "", "", 0),
    ];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(-1);
  });
  it("returns -1 when current is beyond the list", () => {
    const currentIndex = 6;
    const verses = [
      new Verse(0, "Verse 1", "", "", "", 0),
      new Verse(1, "Verse 2", "", "", "", 0),
      new Verse(3, "Verse 4", "", "", "", 0),
      new Verse(5, "Verse 6", "", "", "", 0),
    ];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(-1);
  });
  it("returns -1 when list is empty", () => {
    const currentIndex = -1;
    const verses = [];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(-1);
  });
  it("returns -1 when list is empty 2", () => {
    const currentIndex = 0;
    const verses = [];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(-1);
  });
  it("returns -1 when list is empty 3", () => {
    const currentIndex = 10;
    const verses = [];

    expect(getNextVerseIndex(verses, currentIndex)).toBe(-1);
  });
});
