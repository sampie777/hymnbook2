import { createCopyright } from "../../../../source/logic/songs/utils";
import { Song, SongBundle } from "../../../../source/logic/db/models/Songs";

describe("creating copyright for song", () => {
  const song = new Song("", "", "", "", new Date(), new Date(), [], [], 0, 1);
  const songBundle = new SongBundle("", "name", "", "", "", new Date(), new Date(), "000", "", [], 0);
  song._songBundles = [songBundle];

  it("returns nothing if song is undefined", () => {
    expect(createCopyright(undefined)).toBe("");
  });

  it("returns the priority values as copyright", () => {
    song.author = "";
    song.copyright = "";
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name");
  });

  it("includes the language if these are different as copyright", () => {
    song.author = "";
    song.copyright = "";
    song.language = "AF";
    songBundle.author = "";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name\nAfrikaans");
  });

  it("includes the author if specified", () => {
    song.author = "";
    song.copyright = "";
    song.language = "EN";
    songBundle.author = "author";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name\nauthor");
  });

  it("includes the song author if specified", () => {
    song.author = "songauthor";
    song.copyright = "";
    song.language = "EN";
    songBundle.author = "author";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name\nsongauthor");
  });

  it("includes the song author if specified but no bundle author is specified", () => {
    song.author = "songauthor";
    song.copyright = "";
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name\nsongauthor");
  });

  it("includes the copyright if specified", () => {
    song.author = "";
    song.copyright = "";
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "copyright";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name\ncopyright");
  });

  it("includes the song copyright if specified", () => {
    song.author = "";
    song.copyright = "songcopyright";
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "copyright";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name\nsongcopyright");
  });

  it("includes the song copyright if specified but no bundle copyright is specified", () => {
    song.author = "";
    song.copyright = "songcopyright";
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name\nsongcopyright");
  });

  it("includes all specified information", () => {
    song.author = "";
    song.copyright = "";
    song.language = "EN";
    songBundle.author = "author";
    songBundle.copyright = "copyright";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name\nauthor\ncopyright");
  });

  it("includes all specified information if different", () => {
    song.author = "songauthor";
    song.copyright = "songcopyright";
    song.language = "AF";
    songBundle.author = "author";
    songBundle.copyright = "copyright";
    songBundle.language = "EN";
    expect(createCopyright(song)).toBe("name\nsongauthor\nsongcopyright\nAfrikaans");
  });

  it("includes nothing if no song bundle is specified", () => {
    const song2 = new Song("", "", "", "", new Date(), new Date(), [], [], 0, 1);
    expect(createCopyright(song2)).toBe("");
  });

  it("includes song specified information if no song bundle is specified", () => {
    const song2 = new Song("", "songauthor", "songcopyright", "AF", new Date(), new Date(), [], [], 0, 1);
    expect(createCopyright(song2)).toBe("songauthor\nsongcopyright");
  });
});
