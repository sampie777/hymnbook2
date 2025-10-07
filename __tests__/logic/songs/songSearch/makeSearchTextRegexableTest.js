import {describe, expect, it} from '@jest/globals';
import {SongSearch} from "../../../../source/logic/songs/songSearch";

describe("test converting text to valid regex", () => {
  it("replaces all valid and invalid chars", () => {
    expect(SongSearch.makeSearchTextRegexable("abc")).toBe("abc");
    expect(SongSearch.makeSearchTextRegexable("*abc")).toBe(".*abc");
    expect(SongSearch.makeSearchTextRegexable("a*bc")).toBe("a.*bc");
    expect(SongSearch.makeSearchTextRegexable("abc*")).toBe("abc.*");
    expect(SongSearch.makeSearchTextRegexable("?abc")).toBe(".?abc");
    expect(SongSearch.makeSearchTextRegexable("a?bc")).toBe("a.?bc");
    expect(SongSearch.makeSearchTextRegexable("abc?")).toBe("abc.?");
    expect(SongSearch.makeSearchTextRegexable("abc.")).toBe("abc\\.");
    expect(SongSearch.makeSearchTextRegexable("[abc]")).toBe("\\[abc\\]");
    expect(SongSearch.makeSearchTextRegexable("(abc)+")).toBe("\\(abc\\)\\+");
    expect(SongSearch.makeSearchTextRegexable("(ab?c)+*")).toBe("\\(ab.?c\\)\\+.*");
    expect(SongSearch.makeSearchTextRegexable("^ab!c$")).toBe("\\^ab\\!c\\$");
  });
  it("inserts optional punctuation in sentences", () => {
    expect(SongSearch.makeSearchTextRegexable("abc def ghi")).toBe("abc.? def.? ghi");
    expect(SongSearch.makeSearchTextRegexable("abc ")).toBe("abc ");
    expect(SongSearch.makeSearchTextRegexable(" abc")).toBe(" abc");
    expect(SongSearch.makeSearchTextRegexable(" abc def ghi ")).toBe(" abc.? def.? ghi ");
  });
  it("makes sure the text is regex parsable", () => {
    RegExp(SongSearch.makeSearchTextRegexable("abc"));
    RegExp(SongSearch.makeSearchTextRegexable("*abc"));
    RegExp(SongSearch.makeSearchTextRegexable("a*bc"));
    RegExp(SongSearch.makeSearchTextRegexable("abc*"));
    RegExp(SongSearch.makeSearchTextRegexable("?abc"));
    RegExp(SongSearch.makeSearchTextRegexable("a?bc"));
    RegExp(SongSearch.makeSearchTextRegexable("abc?"));
    RegExp(SongSearch.makeSearchTextRegexable("abc."));
    RegExp(SongSearch.makeSearchTextRegexable("[abc]"));
    RegExp(SongSearch.makeSearchTextRegexable("(abc)+"));
    RegExp(SongSearch.makeSearchTextRegexable("(ab?c)+*"));
    RegExp(SongSearch.makeSearchTextRegexable("^ab!c$"));
    RegExp(SongSearch.makeSearchTextRegexable("abc def ghi"));
    RegExp(SongSearch.makeSearchTextRegexable("abc "));
    RegExp(SongSearch.makeSearchTextRegexable(" abc"));
    RegExp(SongSearch.makeSearchTextRegexable(" abc def ghi "));
  });
});
