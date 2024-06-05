import Db from "../../../../source/logic/db/db";
import { Song, SongBundle } from "../../../../source/logic/db/models/Songs";
import { AbcMelody } from "../../../../source/logic/db/models/AbcMelodies";
import { SongBundleSchema } from "../../../../source/logic/db/models/SongsSchema";
import { SongUpdaterUtils } from "../../../../source/logic/songs/songUpdaterUtils";

describe("copy user settings during songbundle update", () => {
  let songId = 1;
  let melodyId = 1;
  let songBundleId = 1;

  const createBundle = () => {
    const song1 = new Song("Song 1", "", new Date(), new Date(), "song1", [], [], [], songId++, 1);
    const song2 = new Song("Song 2", "", new Date(), new Date(), "song2", [], [
      new AbcMelody("Default", "", "melody2.1", [], melodyId++),
    ], [], songId++, 2);
    const song3 = new Song("Song 3", "", new Date(), new Date(), "song3", [], [
      new AbcMelody("Different", "", "melody3.1", [], melodyId++),
    ], [], songId++, 3);
    const song4 = new Song("Song 4", "", new Date(), new Date(), "song4", [], [
      new AbcMelody("Default", "", "melody4.1", [], melodyId++),
      new AbcMelody("Different", "", "melody4.1", [], melodyId++),
    ], [], songId++, 4);

    return new SongBundle(`Bundle ${songBundleId}`, "", "", "", "", new Date(), new Date(), "000", "", [
      song1,
      song2,
      song3,
      song4,
    ], songBundleId++);
  };

  const existingSongBundle = createBundle();
  const newSongBundle = createBundle();

  beforeEach(() => {
    songId = 1;
    melodyId = 1;
    songBundleId = 1;

    Db.songs.deleteDb();
    return Db.songs.connect().then(() =>
      Db.songs.realm().write(() => {
        Db.songs.realm().create(SongBundleSchema.name, existingSongBundle);
        Db.songs.realm().create(SongBundleSchema.name, newSongBundle);
      }),
    );
  });

  afterEach(() => {
    Db.songs.deleteDb();
  });

  it("only copies nothing if there are no selected melodies", () => {
    SongUpdaterUtils.copyUserSettingsToExistingSongBundles(newSongBundle);

    const newDbBundle = Db.songs.realm().objectForPrimaryKey<SongBundle>(SongBundleSchema.name, newSongBundle.id)!;
    expect(newDbBundle.songs.length).toBe(newSongBundle.songs.length);
    expect(newDbBundle.songs[0].lastUsedMelody).toBeNull();
    expect(newDbBundle.songs[1].lastUsedMelody).toBeNull();
    expect(newDbBundle.songs[2].lastUsedMelody).toBeNull();
    expect(newDbBundle.songs[3].lastUsedMelody).toBeNull();
  });

  it("only doesnt copy default selected melodies", () => {
    const existingDbBundle = Db.songs.realm().objectForPrimaryKey<SongBundle>(SongBundleSchema.name, existingSongBundle.id)!;
    expect(existingDbBundle.songs.length).toBe(existingSongBundle.songs.length);
    Db.songs.realm().write(() => {
      existingDbBundle.songs[1].lastUsedMelody = existingDbBundle.songs[1].abcMelodies[0];
      existingDbBundle.songs[3].lastUsedMelody = existingDbBundle.songs[3].abcMelodies[0];
    });

    SongUpdaterUtils.copyUserSettingsToExistingSongBundles(newSongBundle);

    const newDbBundle = Db.songs.realm().objectForPrimaryKey<SongBundle>(SongBundleSchema.name, newSongBundle.id)!;
    expect(newDbBundle.songs.length).toBe(newSongBundle.songs.length);
    expect(newDbBundle.songs[0].lastUsedMelody).toBeNull();
    expect(newDbBundle.songs[1].lastUsedMelody).toBeNull();
    expect(newDbBundle.songs[2].lastUsedMelody).toBeNull();
    expect(newDbBundle.songs[3].lastUsedMelody).toBeNull();
  });

  it("only copies non-default selected melodies", () => {
    const existingDbBundle = Db.songs.realm().objectForPrimaryKey<SongBundle>(SongBundleSchema.name, existingSongBundle.id)!;
    expect(existingDbBundle.songs.length).toBe(existingSongBundle.songs.length);
    Db.songs.realm().write(() => {
      existingDbBundle.songs[2].lastUsedMelody = existingDbBundle.songs[2].abcMelodies[0];
      existingDbBundle.songs[3].lastUsedMelody = existingDbBundle.songs[3].abcMelodies[1];
    });

    SongUpdaterUtils.copyUserSettingsToExistingSongBundles(newSongBundle);

    const newDbBundle = Db.songs.realm().objectForPrimaryKey<SongBundle>(SongBundleSchema.name, newSongBundle.id)!;
    expect(newDbBundle.songs.length).toBe(newSongBundle.songs.length);
    expect(newDbBundle.songs[0].lastUsedMelody).toBeNull();
    expect(newDbBundle.songs[1].lastUsedMelody).toBeNull();
    expect(newDbBundle.songs[2].lastUsedMelody?.uuid).toBe(newDbBundle.songs[2].abcMelodies[0].uuid);
    expect(newDbBundle.songs[3].lastUsedMelody?.uuid).toBe(newDbBundle.songs[3].abcMelodies[1].uuid);
  });
});
