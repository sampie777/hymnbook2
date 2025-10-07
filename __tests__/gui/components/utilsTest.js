import {describe, expect, it} from '@jest/globals';
import {mergeStyleSheets} from "../../../source/gui/components/utils";

describe("Test utils", () => {
  it("combines styles", () => {
    const sheet1 = {
      view: {
        backgroundColor: "red",
      },
      text: {
        fontSize: 100,
      },
    };
    const sheet2 = {
      view: {
        backgroundColor: "red",
      },
      text: {
        color: "red",
      },
    };
    const sheet3 = {
      text: {
        color: "blue",
      },
    };
    const result = mergeStyleSheets([sheet1, [sheet2, sheet3]]);

    expect(result).toStrictEqual({
      view: [
        { backgroundColor: "red" },
        { backgroundColor: "red" },
      ],
      text: [
        { fontSize: 100 },
        { color: "red" },
        { color: "blue" },
      ],
    });
  });
});
