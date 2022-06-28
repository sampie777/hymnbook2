import { isSongLanguageDifferentFromSongBundle } from "../../../../source/logic/songs/utils";
import { Song, SongBundle } from "../../../../source/logic/db/models/Songs";

describe("test if song language is different from bundle", () => {
  const song = new Song("", "", "", "", new Date(), new Date(), [], [], 0, 1);
  const songBundle = new SongBundle("", "", "", "", "", new Date(), new Date(), "000", [], 0);

  it("returns false if both languages are the same", () => {
    song.language = "AF";
    songBundle.language = "AF";
    expect(isSongLanguageDifferentFromSongBundle(song, songBundle)).toBe(false);
  });
  it("returns true if both languages are the different", () => {
    song.language = "NL";
    songBundle.language = "AF";
    expect(isSongLanguageDifferentFromSongBundle(song, songBundle)).toBe(true);
  });
  it("returns false if bundle language is empty", () => {
    song.language = "NL";
    songBundle.language = "";
    expect(isSongLanguageDifferentFromSongBundle(song, songBundle)).toBe(false);
  });
  it("returns false if song language is empty", () => {
    song.language = "";
    songBundle.language = "AF";
    expect(isSongLanguageDifferentFromSongBundle(song, songBundle)).toBe(false);
  });
  it("returns false if both languages are empty", () => {
    song.language = "";
    songBundle.language = "";
    expect(isSongLanguageDifferentFromSongBundle(song, songBundle)).toBe(false);
  });
  it("returns false if bundle is undefined", () => {
    song.language = "NL";
    expect(isSongLanguageDifferentFromSongBundle(song, undefined)).toBe(false);
  });
  it("returns false if song is undefined", () => {
    expect(isSongLanguageDifferentFromSongBundle(undefined, undefined)).toBe(false);
  });
});
