import { getBundleYear } from "../../../../source/gui/screens/downloads/SongBundleDetailsScreen";

describe("getBundleYear", () => {
  it("extracts year from bundle name", () => {
    expect(getBundleYear({ name: "Psalms 1953" })).toBe("1953");
    expect(getBundleYear({ name: "Liedboek 2013" })).toBe("2013");
    expect(getBundleYear({ name: "Gereformeerde Kerkboek (2001)" })).toBe("2001");
  });

  it("extracts year from copyright if not in name", () => {
    expect(getBundleYear({ name: "Skrifberymings", copyright: "© 2001 NG Kerk" })).toBe("2001");
    expect(getBundleYear({ name: "Old Hymns", copyright: "Public domain, recorded 1885" })).toBe("1885");
  });

  it("falls back to createdAt date year", () => {
    expect(getBundleYear({ name: "General Songs", createdAt: new Date("2024-05-10T12:00:00Z") })).toBe("2024");
    expect(getBundleYear({ name: "General Songs", createdAt: "2023-01-01" })).toBe("2023");
  });

  it("returns undefined when no year is available", () => {
    expect(getBundleYear(undefined)).toBeUndefined();
    expect(getBundleYear({ name: "Simple Songs" })).toBeUndefined();
    expect(getBundleYear({ name: "Simple Songs", copyright: "All rights reserved" })).toBeUndefined();
  });
});
