import { Song, Verse } from "../../../../source/logic/db/models/Songs";
import { generateSongTitle } from "../../../../source/logic/songs/utils";

describe("test generating song title", () => {
  const song = new Song("Psalm 1", "", "", "", new Date(), new Date(), [], 0, 1, "", "");

  it("with non following verses generates all verses", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(3, "Verse 4", "", "", 0),
      new Verse(5, "Verse 6", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1, 2, 4, 6");
  });

  it("with following verses combines these verses", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(2, "Verse 3", "", "", 0),
      new Verse(5, "Verse 6", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1-3, 6");
  });

  it("with only following verses", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(2, "Verse 3", "", "", 0),
      new Verse(3, "Verse 4", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1-4");
  });

  it("with one verse", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1");
  });

  it("with two following verses doesn't combine them", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1, 2");
  });

  it("with following verses combines these verses 2", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(2, "Verse 3", "", "", 0),
      new Verse(3, "Verse 4", "", "", 0),
      new Verse(4, "Verse 5", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1, 3-5");
  });

  it("with multiple following verses", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(2, "Verse 3", "", "", 0),
      new Verse(4, "Verse 5", "", "", 0),
      new Verse(5, "Verse 6", "", "", 0),
      new Verse(6, "Verse 7", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1-3, 5-7");
  });

  it("with multiple following and single verses", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(2, "Verse 3", "", "", 0),
      new Verse(4, "Verse 5", "", "", 0),
      new Verse(6, "Verse 7", "", "", 0),
      new Verse(7, "Verse 8", "", "", 0),
      new Verse(8, "Verse 9", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1-3, 5, 7-9");
  });

  it("but index doesnt mind, only name", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(0, "Verse 3", "", "", 0),
      new Verse(1, "Verse 5", "", "", 0),
      new Verse(0, "Verse 7", "", "", 0),
      new Verse(1, "Verse 8", "", "", 0),
      new Verse(0, "Verse 9", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1-3, 5, 7-9");
  });

  it("can handle non numeric names", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2a", "", "", 0),
      new Verse(0, "Verse 3", "", "", 0),
      new Verse(1, "Verse 5", "", "", 0),
      new Verse(0, "Verse 7", "", "", 0),
      new Verse(1, "Verse 8", "", "", 0),
      new Verse(0, "Verse 9", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1, 2a, 3, 5, 7-9");
  });

  it("ignores other types", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Chorus", "", "", 0),
      new Verse(2, "Verse 3", "", "", 0),
      new Verse(3, "End", "", "", 0),
      new Verse(6, "Verse 7", "", "", 0),
      new Verse(7, "Verse 8", "", "", 0),
      new Verse(8, "Verse 9", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1: 1, 3, 7-9");
  });

  it("with no verse types creates default title", () => {
    const selectedVerses = [
      new Verse(1, "Chorus", "", "", 0),
      new Verse(3, "End", "", "", 0),
    ];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1");
  });

  it("without verses", () => {
    const selectedVerses = [];
    expect(generateSongTitle(song, selectedVerses)).toBe("Psalm 1");
  });
});
