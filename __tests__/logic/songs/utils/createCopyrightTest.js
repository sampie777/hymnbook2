import { createCopyright } from "../../../../source/logic/songs/utils";
import { Song, SongBundle, SongMetadata, SongMetadataType } from "../../../../source/logic/db/models/Songs";

describe("creating copyright for song", () => {
  const song = new Song("", "", new Date(), new Date(), "", [], [], [], 0, 1);
  const songBundle = new SongBundle("", "name", "", "", "", new Date(), new Date(), "000", "", [], 0);
  song._songBundles = [songBundle];

  beforeEach(() => {
    song.metadata = [];
  });

  it("returns nothing if song is undefined", () => {
    expect(createCopyright(undefined)).toStrictEqual([]);
  });

  it("returns the priority values as copyright", () => {
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["name"]);
  });

  it("includes the language if these are different as copyright", () => {
    song.language = "AF";
    songBundle.author = "";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["Afrikaans","name"]);
  });

  it("includes the author if specified", () => {
    song.language = "EN";
    songBundle.author = "author";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["name","author"]);
  });

  it("includes the song author if specified", () => {
    song.metadata.push(new SongMetadata(SongMetadataType.Author, "songauthor", 0));
    song.language = "EN";
    songBundle.author = "author";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["songauthor","name"]);
  });

  it("includes the song author if specified but no bundle author is specified", () => {
    song.metadata.push(new SongMetadata(SongMetadataType.Author, "songauthor", 0));
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["songauthor","name"]);
  });

  it("includes the copyright if specified", () => {
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "copyright";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["name","copyright"]);
  });

  it("includes the song copyright if specified", () => {
    song.metadata.push(new SongMetadata(SongMetadataType.Copyright, "songcopyright", 0));
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "copyright";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["songcopyright","name"]);
  });

  it("includes the song copyright if specified but no bundle copyright is specified", () => {
    song.metadata.push(new SongMetadata(SongMetadataType.Copyright, "songcopyright", 0));
    song.language = "EN";
    songBundle.author = "";
    songBundle.copyright = "";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["songcopyright","name"]);
  });

  it("includes all specified information", () => {
    song.language = "EN";
    songBundle.author = "author";
    songBundle.copyright = "copyright";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["name","author","copyright"]);
  });

  it("includes all specified information if different", () => {
    song.metadata.push(new SongMetadata(SongMetadataType.Author, "songauthor", 0));
    song.metadata.push(new SongMetadata(SongMetadataType.Copyright, "songcopyright", 0));
    song.language = "AF";
    songBundle.author = "author";
    songBundle.copyright = "copyright";
    songBundle.language = "EN";
    expect(createCopyright(song)).toStrictEqual(["songauthor","songcopyright","Afrikaans","name"]);
  });

  it("includes nothing if no song bundle is specified", () => {
    const song2 = new Song("", "", new Date(), new Date(), "", [], [], [], 0, 1);
    expect(createCopyright(song2)).toStrictEqual([]);
  });

  it("includes song specified information if no song bundle is specified", () => {
    const song2 = new Song("", "AF", new Date(), new Date(), "", [], [], [
      new SongMetadata(SongMetadataType.Author, "songauthor", 0),
      new SongMetadata(SongMetadataType.Copyright, "songcopyright", 0),
    ], 0, 1);
    expect(createCopyright(song2)).toStrictEqual(["songauthor","songcopyright"]);
  });
});
