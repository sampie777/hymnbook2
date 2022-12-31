import { Song, SongBundle } from "../../../../source/logic/db/models/Songs";
import { isTitleSimilarToOtherSongs } from "../../../../source/logic/songs/utils";

describe("test if title is similar to other songs", () => {
  const mockSong = (name,
                    id,
                    songBundleId = 0) =>
    new Song(name, "", "", "", new Date(), new Date(), [], [], id, 0,
      new SongBundle("", "", "", "", "", new Date(), new Date(), "", [], songBundleId));
  const songs = [
    mockSong("Song 1", 101, 0),
    mockSong("Song 2", 102, 0),
    mockSong("Song 3", 103, 0),
  ];

  it("is similar", () => {
    expect(isTitleSimilarToOtherSongs(mockSong("Song 1", 1, 1), songs)).toBe(true);
    expect(isTitleSimilarToOtherSongs(mockSong("Song 2", 2, 1), songs)).toBe(true);
    expect(isTitleSimilarToOtherSongs(mockSong("Song 1", 1, 2), songs)).toBe(true);
  });

  it("is similar if exact name doesn't exist in songs list but starts the same", () => {
    expect(isTitleSimilarToOtherSongs(mockSong("Song 4", 4, 1), songs)).toBe(true);
  });

  it("is not similar if same song bundle", () => {
    expect(isTitleSimilarToOtherSongs(mockSong("Song 1", 1, 0), songs)).toBe(false);
    expect(isTitleSimilarToOtherSongs(mockSong("Song 2", 2, 0), songs)).toBe(false);
    expect(isTitleSimilarToOtherSongs(mockSong("Song 4", 4, 0), songs)).toBe(false);
  });

  it("is not similar if same id", () => {
    expect(isTitleSimilarToOtherSongs(mockSong("Song 1", 101, 0), songs)).toBe(false);
    expect(isTitleSimilarToOtherSongs(mockSong("Song 2", 102, 0), songs)).toBe(false);
  });

  it("is similar if same id and different song bundle", () => {
    expect(isTitleSimilarToOtherSongs(mockSong("Song 1", 101, 1), songs)).toBe(true);
    expect(isTitleSimilarToOtherSongs(mockSong("Song 2", 102, 1), songs)).toBe(true);
  });

  it("is not similar if name starts different", () => {
    expect(isTitleSimilarToOtherSongs(mockSong("Book 1", 1, 1), songs)).toBe(false);
    expect(isTitleSimilarToOtherSongs(mockSong("Book 2", 2, 1), songs)).toBe(false);
  });

  it("is not similar if name starts different and is same bundle", () => {
    expect(isTitleSimilarToOtherSongs(mockSong("Book 1", 1, 0), songs)).toBe(false);
    expect(isTitleSimilarToOtherSongs(mockSong("Book 2", 2, 0), songs)).toBe(false);
  });

  it("is not similar if id is same and name starts different and is same bundle", () => {
    expect(isTitleSimilarToOtherSongs(mockSong("Book 1", 101, 0), songs)).toBe(false);
    expect(isTitleSimilarToOtherSongs(mockSong("Book 2", 102, 0), songs)).toBe(false);
  });

  it("is not similar if id is same and name starts different and is different bundle", () => {
    expect(isTitleSimilarToOtherSongs(mockSong("Book 1", 101, 0), songs)).toBe(false);
    expect(isTitleSimilarToOtherSongs(mockSong("Book 2", 102, 0), songs)).toBe(false);
  });
});
