import {describe, expect, it, jest} from '@jest/globals';
import {clearOrSelectAll} from "../../../../source/logic/songs/versePicker";
import {Verse} from "../../../../source/logic/db/models/songs/Songs";
import {mockDb} from "../../../testUtils";

jest.mock("hymnbook2/source/logic/db/db");
mockDb();

describe("test de-/selecting all", () => {
  it("deselects all when some are selected", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", ""),
      new Verse(1, "Verse 2", "", "", ""),
    ];
    const allVerses = [
      new Verse(0, "Verse 1", "", "", ""),
      new Verse(1, "Verse 2", "", "", ""),
      new Verse(3, "Verse 4", "", "", ""),
      new Verse(5, "Verse 6", "", "", ""),
    ];
    expect(clearOrSelectAll(selectedVerses, allVerses)).toStrictEqual([]);
  });
  it("deselects all when all are selected", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", ""),
      new Verse(1, "Verse 2", "", "", ""),
      new Verse(3, "Verse 4", "", "", ""),
      new Verse(5, "Verse 6", "", "", ""),
    ];
    const allVerses = [
      new Verse(0, "Verse 1", "", "", ""),
      new Verse(1, "Verse 2", "", "", ""),
      new Verse(3, "Verse 4", "", "", ""),
      new Verse(5, "Verse 6", "", "", ""),
    ];
    expect(clearOrSelectAll(selectedVerses, allVerses)).toStrictEqual([]);
  });

  it("selects all when none are selected", () => {
    const selectedVerses = [];
    const allVerses = [
      new Verse(0, "Verse 1", "", "", ""),
      new Verse(1, "Verse 2", "", "", ""),
      new Verse(3, "Verse 4", "", "", ""),
      new Verse(5, "Verse 6", "", "", ""),
    ];
    expect(clearOrSelectAll(selectedVerses, allVerses)).toStrictEqual(allVerses);
  });
});
