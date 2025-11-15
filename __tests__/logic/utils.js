import {describe, expect, it} from '@jest/globals';
import {objectToArrayIfNotAlready, readableFileSizeIEC, readableFileSizeSI} from "../../source/logic/utils/utils";

describe("test utils", () => {
  it("converts any object to an array type", () => {
    expect(objectToArrayIfNotAlready(undefined)).toStrictEqual([]);
    expect(objectToArrayIfNotAlready(1)).toStrictEqual([1]);
    expect(objectToArrayIfNotAlready([1])).toStrictEqual([1]);
    expect(objectToArrayIfNotAlready([1, 3])).toStrictEqual([1, 3]);
    expect(objectToArrayIfNotAlready([1, [2, 3]])).toStrictEqual([1, [2, 3]]);
  });

  it("converts file size to readable file sizes in SI units (1000th)", () => {
    expect(readableFileSizeSI(0)).toBe("0 bytes");
    expect(readableFileSizeSI(1)).toBe("1 bytes");
    expect(readableFileSizeSI(999)).toBe("999 bytes");
    expect(readableFileSizeSI(1000)).toBe("1 kB");
    expect(readableFileSizeSI(1001)).toBe("1 kB");
    expect(readableFileSizeSI(1938432)).toBe("1.9 MB");
    expect(readableFileSizeSI(2350080)).toBe("2.4 MB");
    expect(readableFileSizeSI(1014528)).toBe("1.0 MB");
    expect(readableFileSizeSI((1000 - 1) * 1000)).toBe("999 kB");
    expect(readableFileSizeSI(1000 * 1000)).toBe("1.0 MB");
    expect(readableFileSizeSI(1000 * 1000 * 1000)).toBe("1.0 GB");
  })

  it("converts file size to readable file sizes in IEC units (1024th)", () => {
    expect(readableFileSizeIEC(0)).toBe("0 bytes");
    expect(readableFileSizeIEC(1)).toBe("1 bytes");
    expect(readableFileSizeIEC(1023)).toBe("1023 bytes");
    expect(readableFileSizeIEC(1024)).toBe("1 KiB");
    expect(readableFileSizeIEC(1025)).toBe("1 KiB");
    expect(readableFileSizeIEC(1938432)).toBe("1.8 MiB");
    expect(readableFileSizeIEC(2350080)).toBe("2.2 MiB");
    expect(readableFileSizeIEC(1014528)).toBe("991 KiB");
    expect(readableFileSizeIEC((1024 - 1) * 1024)).toBe("1023 KiB");
    expect(readableFileSizeIEC(1024 * 1024)).toBe("1.0 MiB");
    expect(readableFileSizeIEC(1024 * 1024 * 1024)).toBe("1.0 GiB");
  })
});
