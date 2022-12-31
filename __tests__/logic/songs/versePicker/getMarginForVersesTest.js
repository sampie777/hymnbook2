import { getMarginForVerses } from "../../../../source/logic/songs/versePicker";

describe("test getting margin for verses", () => {
  it("doesnt give a negative margin", () => {
    const minMargin = 8;
    const itemsPerRow = 5;
    expect(getMarginForVerses({ width: 100, height: 1000 }, 10, 50,
      {
        minMargin,
        itemsPerRow,
      }))
      .toBe(8);
  });
  it("gives padding for 5 items", () => {
    const minMargin = 8;
    const itemsPerRow = 5;
    expect(getMarginForVerses({ width: 500, height: 1000 }, 10, 50,
      {
        minMargin,
        itemsPerRow,
      }))
      .toBe(23);
  });
  it("gives min padding for 5 items on max", () => {
    const minMargin = 8;
    const itemsPerRow = 5;
    const limitScreenWidth = (50 + 2 * minMargin) * itemsPerRow + 2 * 10;
    expect(getMarginForVerses({ width: limitScreenWidth, height: 1000 }, 10, 50,
      {
        minMargin,
        itemsPerRow,
      }))
      .toBe(minMargin);
  });

  it("gives padding for 5 items when near limit", () => {
    const minMargin = 8;
    const itemsPerRow = 5;
    const limitScreenWidth = 2 * itemsPerRow * (2 * minMargin + 50) + 2 * 10;

    expect(Math.round(getMarginForVerses({ width: limitScreenWidth - 1, height: 1000 }, 10, 50,
      {
        minMargin,
        itemsPerRow,
      })))
      .toBe(41);
  });
  it("gives padding for 10 items when over limit", () => {
    const minMargin = 8;
    const itemsPerRow = 5;
    const limitScreenWidth = 2 * itemsPerRow * (2 * minMargin + 50) + 2 * 10;

    expect(getMarginForVerses({ width: limitScreenWidth, height: 1000 }, 10, 50,
      {
        minMargin,
        itemsPerRow,
      }))
      .toBe(minMargin);
  });
});
