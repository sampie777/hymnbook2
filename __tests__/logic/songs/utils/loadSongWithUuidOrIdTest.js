import {loadSongWithUuidOrId} from "../../../../source/logic/songs/utils";
import Db from "../../../../source/logic/db/db";
import {SongBundleSchema, SongMetadataSchema, SongSchema} from "../../../../source/logic/db/models/SongsSchema";
import {Song, SongBundle, SongMetadata, SongMetadataType} from "../../../../source/logic/db/models/Songs";

describe("when loading a song from the database using uuid or id", () => {
    let song1 = new Song("Psalm 1", "", new Date(), new Date(), "song1-uuid", [], [], [
        new SongMetadata(SongMetadataType.AlternativeTitle, "Lofsang van Maria", 0),
        new SongMetadata(SongMetadataType.Author, "Sagaria Dinges", 0),
    ], 0, 1);
    let song2 = new Song("Psalm 2", "", new Date(), new Date(), "song2-uuid", [], [], [
        new SongMetadata(SongMetadataType.AlternativeTitle, "Lofsang van Sagaria", 0),
        new SongMetadata(SongMetadataType.TextSource, "Somewhere from", 0),
    ], 0, 2);
    let song3 = new Song("Psalm 3", "", new Date(), new Date(), "same-uuid", [], [], [], 0, 3);
    let song4 = new Song("Sagaria", "", new Date(), new Date(), "same-uuid", [], [], [], 0, 4);
    const songBundle = new SongBundle(
        "T", "Song bundle", "EN", "", "", new Date(), new Date(), "uuid1", "",
        [
            song1,
            song2,
            song3,
            song4,
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

    it("returns undefined if uuid and id are undefined", () => {
        const result = loadSongWithUuidOrId(undefined, undefined)
        expect(result).toBeUndefined()
    })

    it("returns undefined if uuid is null and id is undefined", () => {
        const result = loadSongWithUuidOrId(null, undefined)
        expect(result).toBeUndefined()
    })

    it("returns undefined if uuid is empty and id is undefined", () => {
        const result = loadSongWithUuidOrId("", undefined)
        expect(result).toBeUndefined()
    })

    it("returns the matching song if uuid is not empty", () => {
        const result = loadSongWithUuidOrId(song1.uuid, undefined)
        expect(result.name).toBe(song1.name)
        expect(result.id).toBe(song1.id)
        expect(result.uuid).toBe(song1.uuid)
    })

    it("returns the matching song if id is not undefined", () => {
        const result = loadSongWithUuidOrId(undefined, song1.id)
        expect(result.name).toBe(song1.name)
        expect(result.id).toBe(song1.id)
        expect(result.uuid).toBe(song1.uuid)
    })

    it("returns the matching song if uuid and id is not undefined", () => {
        const result = loadSongWithUuidOrId(song1.uuid, song1.id)
        expect(result.name).toBe(song1.name)
        expect(result.id).toBe(song1.id)
        expect(result.uuid).toBe(song1.uuid)
    })

    it("returns the first matching song if some songs share the same uuid", () => {
        // Given
        expect(song3.uuid).toBe("same-uuid")
        expect(song4.uuid).toBe("same-uuid")

        // When
        const result = loadSongWithUuidOrId("same-uuid", undefined)

        // Then
        expect(result.name).toBe(song3.name)
        expect(result.id).toBe(song3.id)
        expect(result.uuid).toBe(song3.uuid)
        expect(result.uuid).toBe(song4.uuid)
    })

    it("returns the undefined if uuid and id do not exists", () => {
        const result = loadSongWithUuidOrId("aaaaaaaa", 13478139)
        expect(result).toBeUndefined()
    })
})