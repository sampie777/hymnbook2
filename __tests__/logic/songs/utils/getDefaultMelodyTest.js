import { getDefaultMelody } from "../../../../source/logic/songs/utils";
import { Song } from "../../../../source/logic/db/models/songs/Songs";
import { AbcMelody } from "../../../../source/logic/db/models/songs/AbcMelodies";

describe("test getting default melody for song", () => {
  const melody1 = new AbcMelody("Default", "", "", [], 1);
  const melody2 = new AbcMelody("Melody 2", "", "", [], 2);
  const melody3 = new AbcMelody("Melody 3", "", "", [], 3);
  const song = new Song("", "", "", "", new Date(), new Date(), "", [], [], 0, 1);

  it("returns undefined if song is undefined", () => {
    expect(getDefaultMelody(undefined)).toBe(undefined);
  });
  it("returns undefined if song melodies is undefined", () => {
    song.abcMelodies = undefined;
    song.lastUsedMelody = undefined;
    expect(getDefaultMelody(song)).toBe(undefined);
  });
  it("returns undefined if song has no melodies", () => {
    song.abcMelodies = [];
    song.lastUsedMelody = undefined;
    expect(getDefaultMelody(song)).toBe(undefined);
  });
  it("returns undefined if song has no melodies and existing lastUsedMelody", () => {
    song.abcMelodies = [];
    song.lastUsedMelody = melody1;
    expect(getDefaultMelody(song)).toBe(undefined);
  });

  it("returns first melody if song has only one melody", () => {
    song.abcMelodies = [melody1];
    song.lastUsedMelody = undefined;
    expect(getDefaultMelody(song)).toBe(melody1);
  });
  it("returns first melody if song has only one melody and existing lastUsedMelody", () => {
    song.abcMelodies = [melody1];
    song.lastUsedMelody = melody1;
    expect(getDefaultMelody(song)).toBe(melody1);
  });
  it("returns first melody if song has only one melody and non-existing lastUsedMelody", () => {
    song.abcMelodies = [melody1];
    song.lastUsedMelody = melody2;
    expect(getDefaultMelody(song)).toBe(melody1);
  });

  it("returns last used melody if song has multiple melodies and existing lastUsedMelody", () => {
    song.abcMelodies = [melody1, melody2];
    song.lastUsedMelody = melody1;
    expect(getDefaultMelody(song)).toBe(melody1);
    song.lastUsedMelody = melody2;
    expect(getDefaultMelody(song)).toBe(melody2);
  });

  it("returns Default melody if song has multiple melodies and undefined lastUsedMelody", () => {
    song.abcMelodies = [melody2, melody1];
    song.lastUsedMelody = undefined;
    expect(getDefaultMelody(song)).toBe(melody1);
  });
  it("returns Default melody if song has multiple melodies and non-existing lastUsedMelody", () => {
    song.abcMelodies = [melody1, melody2];
    song.lastUsedMelody = melody3;
    expect(getDefaultMelody(song)).toBe(melody1);
  });
  it("returns first melody if song has multiple melodies and undefined lastUsedMelody and no Default melody", () => {
    song.abcMelodies = [melody2, melody3];
    song.lastUsedMelody = undefined;
    expect(getDefaultMelody(song)).toBe(melody2);
  });
  it("returns first melody if song has multiple melodies and non-existing lastUsedMelody and no Default melody", () => {
    song.abcMelodies = [melody2, melody3];
    song.lastUsedMelody = melody1;
    expect(getDefaultMelody(song)).toBe(melody2);
  });
});
