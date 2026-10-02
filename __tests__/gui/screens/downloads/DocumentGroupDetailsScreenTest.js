import { getDocumentGroupYear } from "../../../../source/gui/screens/downloads/DocumentGroupDetailsScreen";

describe("getDocumentGroupYear", () => {
  it("extracts year from group name", () => {
    expect(getDocumentGroupYear({ name: "Church Order 1984" })).toBe("1984");
    expect(getDocumentGroupYear({ name: "Creeds and Confessions (2011 edition)" })).toBe("2011");
  });

  it("falls back to createdAt date year", () => {
    expect(getDocumentGroupYear({ name: "Catechism", createdAt: "2020-05-12T00:00:00.000Z" })).toBe("2020");
    expect(getDocumentGroupYear({ name: "Liturgy", createdAt: new Date(2018, 0, 1) })).toBe("2018");
  });

  it("returns undefined when no year is available", () => {
    expect(getDocumentGroupYear({ name: "Psalter" })).toBeUndefined();
    expect(getDocumentGroupYear(undefined)).toBeUndefined();
  });
});
