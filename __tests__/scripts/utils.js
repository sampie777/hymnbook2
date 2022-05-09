import { objectToArrayIfNotAlready } from "../../source/scripts/utils";

describe("test utils", () => {
  it("converts any object to an array type", () => {
    expect(objectToArrayIfNotAlready(undefined)).toStrictEqual([]);
    expect(objectToArrayIfNotAlready(1)).toStrictEqual([1]);
    expect(objectToArrayIfNotAlready([1])).toStrictEqual([1]);
    expect(objectToArrayIfNotAlready([1, 3])).toStrictEqual([1, 3]);
    expect(objectToArrayIfNotAlready([1, [2, 3]])).toStrictEqual([1, [2, 3]]);
  });
});
