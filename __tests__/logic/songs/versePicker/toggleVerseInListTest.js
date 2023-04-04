import { toggleVerseInList } from "../../../../source/logic/songs/versePicker";
import { Verse } from "../../../../source/logic/db/models/Songs";

describe("test toggleVerseInList function", () => {
  const verses = [
    new Verse(1, "Verse 2", "", "", "", 0),
    new Verse(3, "Verse 4", "", "", "", 1),
    new Verse(5, "Verse 6", "", "", "", 2),
  ];

  it("removes existing verse from list", () => {
    const verse = new Verse(1, "Verse 2", "", "", "", 0);
    const result = toggleVerseInList(verses, verse);
    expect(result.length).toBe(2);
    expect(result.includes(verse)).toBe(false);
    expect(verses.length).toBe(3);
  });

  it("removes existing verse from list", () => {
    const verse = verses[0];
    const result = toggleVerseInList(verses, verse);
    expect(result.length).toBe(2);
    expect(result.includes(verse)).toBe(false);
    expect(verses.length).toBe(3);
  });

  it("removes existing verse from end of list", () => {
    const verse = verses[2];
    const result = toggleVerseInList(verses, verse);
    expect(result.length).toBe(2);
    expect(result.includes(verse)).toBe(false);
    expect(verses.length).toBe(3);
  });

  it("adds new verse to list", () => {
    const verse = new Verse(1, "Verse 2", "", "", "", 10);
    const result = toggleVerseInList(verses, verse);
    expect(result.length).toBe(4);
    expect(result.includes(verse)).toBe(true);
    expect(verses.length).toBe(3);
  });

  it("adds new verse to list and sorts list", () => {
    const verse = new Verse(2, "Verse 2", "", "", "", 10);
    const result = toggleVerseInList(verses, verse);
    expect(result.indexOf(verse)).toBe(1);
    expect(verses.length).toBe(3);
  });

  it("removes existing verse from list and sorts list", () => {
    const verse = verses[1];
    const result = toggleVerseInList(verses, verse);
    expect(result[0].index).toBe(1);
    expect(result[1].index).toBe(5);
    expect(verses.length).toBe(3);
  });

  it("adds and removes verse from list", () => {
    const verse = new Verse(1, "Verse 2", "", "", "", 10);
    let result = toggleVerseInList(verses, verse);

    result = toggleVerseInList(result, verse);
    expect(result.length).toBe(3);
    expect(result.includes(verse)).toBe(false);

    result = toggleVerseInList(result, verse);
    expect(result.length).toBe(4);
    expect(result.includes(verse)).toBe(true);
    expect(verses.length).toBe(3);
  });
});
