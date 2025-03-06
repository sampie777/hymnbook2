import { Song, SongBundle, SongMetadata, SongMetadataType } from "../../../../source/logic/db/models/songs/Songs";
import Db from "../../../../source/logic/db/db";
import { SongBundleSchema, SongMetadataSchema, SongSchema } from "../../../../source/logic/db/models/songs/SongsSchema";
import { SongSearch } from "../../../../source/logic/songs/songSearch";

describe("Song search find songs by text", () => {
  const songBundle = new SongBundle(
    "T", "Song bundle", "EN", "", "", new Date(), new Date(), "uuid1", "",
    [
      new Song("Psalm 1", "", new Date(), new Date(), "", [], [], [
        new SongMetadata(SongMetadataType.AlternativeTitle, "Lofsang van Maria", 0),
        new SongMetadata(SongMetadataType.Author, "Sagaria Dinges", 0),
      ], 0, 1),
      new Song("Psalm 2", "", new Date(), new Date(), "", [], [], [
        new SongMetadata(SongMetadataType.AlternativeTitle, "Lofsang van Sagaria", 0),
        new SongMetadata(SongMetadataType.TextSource, "Somewhere from", 0),
      ], 0, 2),
      new Song("Psalm 3", "", new Date(), new Date(), "", [], [], [], 0, 3),
      new Song("Sagaria", "", new Date(), new Date(), "", [], [], [], 0, 4),
    ],
    0,
  );

  beforeAll(() => {
    Db.songs.deleteDb();
    return Db.songs.connect()
      .then(() => {
        let bundleId = Db.songs.getIncrementedPrimaryKey(SongBundleSchema);
        let songId = Db.songs.getIncrementedPrimaryKey(SongSchema);
        let metadataId = Db.songs.getIncrementedPrimaryKey(SongMetadataSchema);

        songBundle.id = bundleId++;
        songBundle.songs.forEach(song => {
          song.id = songId++;
          song.metadata.forEach(it => it.id = metadataId++);
        });

        Db.songs.realm().write(() => {
          Db.songs.realm().create(SongBundleSchema.name, songBundle);
        });
      });
  });

  afterAll(() => {
    Db.songs.deleteDb();
  });

  it("find by alternative and main titles", () => {
    const result = SongSearch.find("Sagaria", true, false);
    expect(result.length).toBe(2);
    expect(result[0].song.name).toBe("Psalm 2");
    expect(result[0].points).toBe(SongSearch.alternativeTitleMatchPoints);
    expect(result[1].song.name).toBe("Sagaria");
    expect(result[1].points).toBe(SongSearch.titleMatchPoints);
  });

});
