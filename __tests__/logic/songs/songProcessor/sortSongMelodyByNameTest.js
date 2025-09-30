import {describe, expect, it} from '@jest/globals';
import {SongProcessor} from "../../../../source/logic/songs/songProcessor";

describe("sorting melodies by name", () => {
  it("keeps Afrikaans language in mind", () => {
    expect(SongProcessor.sortSongMelodyByName({ name: "Default" }, { name: "Default" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Default" }, { name: "Eerste melodie" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Eerste melodie" }, { name: "Default" })).toBe(1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Eerste melodie" }, { name: "Derde melodie" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Derde melodie" }, { name: "Eerste melodie" })).toBe(1);
    expect(SongProcessor.sortSongMelodyByName({ name: "1" }, { name: "2" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "2" }, { name: "1" })).toBe(1);
    expect(SongProcessor.sortSongMelodyByName({ name: "1" }, { name: "1" })).toBe(0);
  });
  it("keeps English language in mind", () => {
    expect(SongProcessor.sortSongMelodyByName({ name: "Default" }, { name: "Default" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Default" }, { name: "First melody" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "First melody" }, { name: "Default" })).toBe(1);
    expect(SongProcessor.sortSongMelodyByName({ name: "First melody" }, { name: "Third melody" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Third melody" }, { name: "First melody" })).toBe(1);
  });
  it("keeps Dutch language in mind", () => {
    expect(SongProcessor.sortSongMelodyByName({ name: "Default" }, { name: "Default" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Default" }, { name: "Eerste melodie" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Eerste melodie" }, { name: "Default" })).toBe(1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Eerste melodie" }, { name: "Derde melodie" })).toBe(-1);
    expect(SongProcessor.sortSongMelodyByName({ name: "Vijfde melodie" }, { name: "Eerste melodie" })).toBe(1);
  });
});
