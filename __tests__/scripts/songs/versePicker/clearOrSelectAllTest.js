import { clearOrSelectAll } from "../../../../source/logic/songs/versePicker";
import { Verse } from "../../../../source/logic/db/models/Songs";

describe("test de-/selecting all", () => {
  it("deselects all when some are selected", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
    ];
    const allVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(3, "Verse 4", "", "", 0),
      new Verse(5, "Verse 6", "", "", 0),
    ];
    expect(clearOrSelectAll(selectedVerses, allVerses)).toStrictEqual([]);
  });
  it("deselects all when all are selected", () => {
    const selectedVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(3, "Verse 4", "", "", 0),
      new Verse(5, "Verse 6", "", "", 0),
    ];
    const allVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(3, "Verse 4", "", "", 0),
      new Verse(5, "Verse 6", "", "", 0),
    ];
    expect(clearOrSelectAll(selectedVerses, allVerses)).toStrictEqual([]);
  });

  it("selects all when none are selected", () => {
    const selectedVerses = [];
    const allVerses = [
      new Verse(0, "Verse 1", "", "", 0),
      new Verse(1, "Verse 2", "", "", 0),
      new Verse(3, "Verse 4", "", "", 0),
      new Verse(5, "Verse 6", "", "", 0),
    ];
    expect(clearOrSelectAll(selectedVerses, allVerses)).toStrictEqual(allVerses);
  });
});
