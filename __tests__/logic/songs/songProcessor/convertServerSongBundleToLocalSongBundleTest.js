import {
  SongVerse as ServerVerse,
  Song as ServerSong,
  SongBundle as ServerSongBundle,
  AbcMelody as ServerAbcMelody,
  AbcSubMelody as ServerAbcSubMelody,
} from "../../../../source/logic/server/models/ServerSongsModel";
import { SongProcessor } from "../../../../source/logic/songs/songProcessor";
import { Song, SongBundle, Verse } from "../../../../source/logic/db/models/Songs";
import { AbcMelody, AbcSubMelody } from "../../../../source/logic/db/models/AbcMelodies";
import Db from "../../../../source/logic/db/db";

jest.mock("hymnbook2/source/logic/db/db");

describe("test convert server songbundle to local songbundle", () => {
  Db.songs.getIncrementedPrimaryKey.mockImplementation(() => 1);
  Db.songs.realm.mockImplementation(() => {
    return {
      objects: () => [],
      write: (callback) => callback ? callback() : undefined,
      create: () => undefined,
      delete: () => undefined,
    };
  });

  it("converts bundle with children to local objects", () => {
    const songs = [
      new ServerSong(0,
        "name0",
        "author",
        "copyright",
        "language",
        [
          new ServerVerse(0, "name0", "content", "language", 0, "verse0", null,
            [new ServerAbcSubMelody(0, "melody0", 0, "submelody0")], "abcLyrics"),
          new ServerVerse(1, "name1", "content", "language", 1, "verse1", null, [], "abcLyrics"),
        ],
        null,
        new Date(),
        new Date(),
        "song0",
        1,
        [
          new ServerAbcMelody(
            0,
            "name0",
            "melody",
            "melody0",
            null,
            null,
          ),
          new ServerAbcMelody(
            1,
            "name1",
            "melody",
            "melody1",
            null,
            null,
          ),
        ],
      ),

      new ServerSong(1, "name1", "author", "copyright", "language", [
        new ServerVerse(2, "name2", "content", "language", 0, "", null, [], "abcLyrics"),
        new ServerVerse(3, "name3", "content", "language", 1, "", null, [], "abcLyrics")], null, new Date(), new Date(), "", 2, null),
    ];
    const bundle = new ServerSongBundle(1,
      "abbreviation",
      "name",
      "language",
      "author",
      "copyright",
      songs,
      new Date(),
      new Date(),
      "uuid",
      100,
    );

    const result = SongProcessor.convertServerSongBundleToLocalSongBundle(bundle);

    expect(result).toBeInstanceOf(SongBundle);
    expect(result.id).toBe(1);
    expect(result.abbreviation).toBe("abbreviation");
    expect(result.name).toBe("name");
    expect(result.language).toBe("language");
    expect(result.author).toBe("author");
    expect(result.copyright).toBe("copyright");
    expect(result.createdAt).toBe(bundle.createdAt);
    expect(result.modifiedAt).toBe(bundle.modifiedAt);
    expect(result.uuid).toBe("uuid");
    expect(result.songs.length).toBe(2);

    expect(result.songs[0]).toBeInstanceOf(Song);
    expect(result.songs[0].id).toBe(1);
    expect(result.songs[0].name).toBe("name0");
    expect(result.songs[0].number).toBe(1);
    expect(result.songs[0].author).toBe("author");
    expect(result.songs[0].copyright).toBe("copyright");
    expect(result.songs[0].language).toBe("language");
    expect(result.songs[0].createdAt).toBe(bundle.songs[0].createdAt);
    expect(result.songs[0].modifiedAt).toBe(bundle.songs[0].modifiedAt);
    expect(result.songs[0].uuid).toBe("song0");
    expect(result.songs[0].lastUsedMelody).toBe(undefined);
    expect(result.songs[0].abcMelodies.length).toBe(2);
    expect(result.songs[0].verses.length).toBe(2);

    expect(result.songs[0].abcMelodies[0]).toBeInstanceOf(AbcMelody);
    expect(result.songs[0].abcMelodies[0].id).toBe(1);
    expect(result.songs[0].abcMelodies[0].name).toBe("name0");
    expect(result.songs[0].abcMelodies[0].melody).toBe("melody");
    expect(result.songs[0].abcMelodies[0].uuid).toBe("melody0");
    expect(result.songs[0].abcMelodies[0].subMelodies.length).toBe(1);

    expect(result.songs[0].abcMelodies[0].subMelodies[0]).toBeInstanceOf(AbcSubMelody);
    expect(result.songs[0].abcMelodies[0].subMelodies[0].id).toBe(1);
    expect(result.songs[0].abcMelodies[0].subMelodies[0].melody).toBe("melody0");
    expect(result.songs[0].abcMelodies[0].subMelodies[0].uuid).toBe("submelody0");
    expect(result.songs[0].abcMelodies[0].subMelodies[0].verse).toBeInstanceOf(Verse);
    expect(result.songs[0].abcMelodies[0].subMelodies[0].verse).toBe(result.songs[0].verses[0]);

    expect(result.songs[0].abcMelodies[1]).toBeInstanceOf(AbcMelody);
    expect(result.songs[0].abcMelodies[1].id).toBe(2);
    expect(result.songs[0].abcMelodies[1].name).toBe("name1");
    expect(result.songs[0].abcMelodies[1].melody).toBe("melody");
    expect(result.songs[0].abcMelodies[1].uuid).toBe("melody1");
    expect(result.songs[0].abcMelodies[1].subMelodies).toStrictEqual([]);

    expect(result.songs[0].verses[0]).toBeInstanceOf(Verse);
    expect(result.songs[0].verses[0].id).toBe(1);
    expect(result.songs[0].verses[0].name).toBe("name0");
    expect(result.songs[0].verses[0].content).toBe("content");
    expect(result.songs[0].verses[0].language).toBe("language");
    expect(result.songs[0].verses[0].index).toBe(0);
    expect(result.songs[0].verses[0].uuid).toBe("verse0");
    expect(result.songs[0].verses[0].abcLyrics).toBe("abcLyrics");

    expect(result.songs[0].verses[1]).toBeInstanceOf(Verse);
    expect(result.songs[0].verses[1].id).toBe(2);
    expect(result.songs[0].verses[1].name).toBe("name1");
    expect(result.songs[0].verses[1].content).toBe("content");
    expect(result.songs[0].verses[1].language).toBe("language");
    expect(result.songs[0].verses[1].index).toBe(1);
    expect(result.songs[0].verses[1].uuid).toBe("verse1");
    expect(result.songs[0].verses[1].abcLyrics).toBe("abcLyrics");

    expect(result.songs[1]).toBeInstanceOf(Song);
    expect(result.songs[1].id).toBe(2);
    expect(result.songs[1].name).toBe("name1");
    expect(result.songs[1].number).toBe(2);
    expect(result.songs[1].author).toBe("author");
    expect(result.songs[1].copyright).toBe("copyright");
    expect(result.songs[1].language).toBe("language");
    expect(result.songs[1].createdAt).toBe(bundle.songs[1].createdAt);
    expect(result.songs[1].modifiedAt).toBe(bundle.songs[1].modifiedAt);
    expect(result.songs[1].lastUsedMelody).toBe(undefined);
    expect(result.songs[1].abcMelodies.length).toBe(0);
    expect(result.songs[1].verses.length).toBe(2);

    expect(result.songs[1].verses[0]).toBeInstanceOf(Verse);
    expect(result.songs[1].verses[0].id).toBe(3);
    expect(result.songs[1].verses[0].name).toBe("name2");
    expect(result.songs[1].verses[0].content).toBe("content");
    expect(result.songs[1].verses[0].language).toBe("language");
    expect(result.songs[1].verses[0].index).toBe(0);
    expect(result.songs[1].verses[0].abcLyrics).toBe("abcLyrics");

    expect(result.songs[1].verses[1]).toBeInstanceOf(Verse);
    expect(result.songs[1].verses[1].id).toBe(4);
    expect(result.songs[1].verses[1].name).toBe("name3");
    expect(result.songs[1].verses[1].content).toBe("content");
    expect(result.songs[1].verses[1].language).toBe("language");
    expect(result.songs[1].verses[1].index).toBe(1);
    expect(result.songs[1].verses[1].abcLyrics).toBe("abcLyrics");
  });
});
