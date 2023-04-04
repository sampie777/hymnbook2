import { getVerseType, VerseType } from "../../../../source/logic/songs/utils";
import { Verse } from "../../../../source/logic/db/models/Songs";

describe("test getting verse type", () => {
  const mockVerse = (name) => new Verse(0, name, "", "", "", 0)

  it("handles verse type correctly", () => {
    expect(getVerseType(mockVerse("verse 1"))).toBe(VerseType.Verse);
    expect(getVerseType(mockVerse("verse 2"))).toBe(VerseType.Verse);
    expect(getVerseType(mockVerse("Verse 1"))).toBe(VerseType.Verse);
    expect(getVerseType(mockVerse("Verse"))).toBe(VerseType.Verse);
    expect(getVerseType(mockVerse("Verse1"))).toBe(VerseType.Verse);
    expect(getVerseType(mockVerse("vers"))).toBe(VerseType.Verse);
    expect(getVerseType(mockVerse("vers 1"))).toBe(VerseType.Verse);
    expect(getVerseType(mockVerse(""))).toBe(VerseType.Verse);
  });

  it("handles chorus type correctly", () => {
    expect(getVerseType(mockVerse("chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("chorus 1"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("chorus 2x"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("chorus (2x)"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("Chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("prechorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("pre-chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("Pre-Chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("pre chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("pre_chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("postchorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("post-chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("Post-Chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("post chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("post_chorus"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("refrain"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("refrein"))).toBe(VerseType.Chorus);
    expect(getVerseType(mockVerse("Refrein 2"))).toBe(VerseType.Chorus);
  });

  it("handles bridge type correctly", () => {
    expect(getVerseType(mockVerse("bridge"))).toBe(VerseType.Bridge);
    expect(getVerseType(mockVerse("bridge 1"))).toBe(VerseType.Bridge);
    expect(getVerseType(mockVerse("bridge 2x"))).toBe(VerseType.Bridge);
    expect(getVerseType(mockVerse("bridge (2x)"))).toBe(VerseType.Bridge);
    expect(getVerseType(mockVerse("Bridge"))).toBe(VerseType.Bridge);
    expect(getVerseType(mockVerse("tussenspel"))).toBe(VerseType.Bridge);
    expect(getVerseType(mockVerse("Tussenspel 2"))).toBe(VerseType.Bridge);
  });

  it("handles end type correctly", () => {
    expect(getVerseType(mockVerse("end"))).toBe(VerseType.End);
    expect(getVerseType(mockVerse("end 1"))).toBe(VerseType.End);
    expect(getVerseType(mockVerse("end 2x"))).toBe(VerseType.End);
    expect(getVerseType(mockVerse("end (2x)"))).toBe(VerseType.End);
    expect(getVerseType(mockVerse("End"))).toBe(VerseType.End);
    expect(getVerseType(mockVerse("outro"))).toBe(VerseType.End);
    expect(getVerseType(mockVerse("Outro 2"))).toBe(VerseType.End);
    expect(getVerseType(mockVerse("slot"))).toBe(VerseType.End);
    expect(getVerseType(mockVerse("Slot 2"))).toBe(VerseType.End);
  });

  it("handles intro type correctly", () => {
    expect(getVerseType(mockVerse("intro"))).toBe(VerseType.Intro);
    expect(getVerseType(mockVerse("intro 1"))).toBe(VerseType.Intro);
    expect(getVerseType(mockVerse("intro 2x"))).toBe(VerseType.Intro);
    expect(getVerseType(mockVerse("intro (2x)"))).toBe(VerseType.Intro);
    expect(getVerseType(mockVerse("Intro"))).toBe(VerseType.Intro);
    expect(getVerseType(mockVerse("inleiding"))).toBe(VerseType.Intro);
    expect(getVerseType(mockVerse("Inleiding 2"))).toBe(VerseType.Intro);
  });
});
