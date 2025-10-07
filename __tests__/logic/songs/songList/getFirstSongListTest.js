import {describe, expect, it, jest} from '@jest/globals';
import SongList from "../../../../source/logic/songs/songList";
import Db from "../../../../source/logic/db/db";
import {SongListModel} from "../../../../source/logic/db/models/songs/SongListModel";
import {mockDb} from "../../../testUtils";

jest.mock("hymnbook2/source/logic/db/db");
mockDb();

describe("test getting first song list", () => {

  const list1 = new SongListModel();
  const list2 = new SongListModel();

  it("returns undefined if db is empty", () => {
    Db.songs.realm.mockImplementation(() => {
      return { objects: () => [] };
    });

    expect(SongList.getFirstSongList()).toBe(undefined);
  });

  it("returns first if list has length==1", () => {
    Db.songs.realm.mockImplementation(() => {
      return { objects: () => [list1] };
    });

    expect(SongList.getFirstSongList()).toStrictEqual(list1);
  });

  it("returns first if list is longer than 1", () => {
    Db.songs.realm.mockImplementation(() => {
      return { objects: () => [list1, list2] };
    });

    expect(SongList.getFirstSongList()).toStrictEqual(list1);
  });
});
