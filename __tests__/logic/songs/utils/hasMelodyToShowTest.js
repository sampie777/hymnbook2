import { Song, Verse } from "../../../../source/logic/db/models/Songs";
import { hasMelodyToShow } from "../../../../source/logic/songs/utils";
import { AbcMelody, AbcSubMelody } from "../../../../source/logic/db/models/AbcMelodies";

describe("test if song has a melody to show", () => {
  const verse1 = new Verse(0, "", "", "", "", [], 0)
  const verse2 = new Verse(1, "", "", "", "", [], 1)
  const song = new Song("", "", "", "", new Date(), new Date(), "", [verse1, verse2], [], 0, 1);

  const abcMelody = new AbcMelody("", "", "", [], 0);

  it("does not have a melody to show if the song is undefined", () => {
    expect(hasMelodyToShow(undefined)).toBe(false);
  });
  it("does not have a melody to show if the song doesn't have a melody but at least one verse has lyrics", () => {
    song.abcMelodies = [];
    verse1.abcLyrics = "123";
    expect(hasMelodyToShow(song)).toBe(false);
  });
  it("does not have a melody to show if the song has a melody but no verses have lyrics", () => {
    song.abcMelodies = [abcMelody];
    verse1.abcLyrics = "";
    verse2.abcLyrics = "";
    expect(hasMelodyToShow(song)).toBe(false);
  });
  it("does not have a melody to show if the song doesn't have a melody but at least one verse has lyrics", () => {
    song.abcMelodies = [];
    verse1.abcLyrics = "123";
    verse2.abcLyrics = "";
    expect(hasMelodyToShow(song)).toBe(false);
  });
  it("does not have a melody to show if the song doesn't have a melody but at least one verse has a melody and lyrics", () => {
    song.abcMelodies = [];
    verse1.abcLyrics = "123";
    new AbcSubMelody("", verse1, "", 0);
    expect(hasMelodyToShow(song)).toBe(false);
  });

  it("does have a melody to show if the song has a melody and at least one verse has lyrics", () => {
    song.abcMelodies = [abcMelody];
    verse1.abcLyrics = "123";
    expect(hasMelodyToShow(song)).toBe(true);
  });
  it("does have a melody to show if the song has multiple melodies and at least one verse has lyrics", () => {
    song.abcMelodies = [abcMelody, new AbcMelody("", "", "", [], 0)];
    verse1.abcLyrics = "123";
    expect(hasMelodyToShow(song)).toBe(true);
  });
});
