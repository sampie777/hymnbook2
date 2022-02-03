import { ABC } from "../../../../source/scripts/songs/abc/abc";


describe("test abc parse", () => {
  it("get field", () => {
    const data = "X:1\n" +
      "T: this is the title\n" +
      "C2 DF E2 F2 | FG G4 A B | G8|]\n" +
      "w: ik ben_ ge-test of niet waar~ik dan ook end_";

    expect(ABC.getField(data, "X")).toBe("1");
    expect(ABC.getField(data, "T")).toBe("this is the title");
    expect(ABC.getField(data, "A")).toBe(undefined);
  })

  it("extracts notes and lyrics", () => {
    const data = "C2 DF E2 F2 | FG G4 A B | G8|]\n" +
      "w: ik ben_ ge-test of niet waar~ik dan ook end_";

    const result = ABC.extractNotesAndLyrics(data);
    expect(result.notes).toBe("C2 DF E2 F2 | FG G4 A B | G8|]");
    expect(result.lyrics).toBe("ik ben_ ge-test of niet waar~ik dan ook end_");
  })
  it("extracts notes and lyrics from multiline", () => {
    const data = "C2 DF E2 F2 |\n" +
      "w: ik ben_ ge-test\n" +
      "FG G4 A B | G8|]\n" +
      "w: of niet waar~ik dan ook end_";

    const result = ABC.extractNotesAndLyrics(data);
    expect(result.notes).toBe("C2 DF E2 F2 | FG G4 A B | G8|]");
    expect(result.lyrics).toBe("ik ben_ ge-test of niet waar~ik dan ook end_");
  })

  it("converts abc notation to abcjs TuneOjbect", () => {
    const data = "X:1\n" +
      "T: this is the title\n" +
      "C2 DF E2 F2 | FG G4 A B | G8|]\n" +
      "w: ik ben_ ge-test of niet waar~ik dan ook end_";

    const tuneObject = ABC.convertStringToAbcTune(data);
    const notes = tuneObject.lines[0].staff[0].voices[0];

    const output = [];
    notes.forEach(it => {
      if (it.el_type === "bar") {
        if (it.type === "bar_thin_thick") {
          output.push("=======");
        } else {
          output.push("-------");
        }
        return
      }

      if (it.pitches[0].pitch !== it.pitches[0].verticalPos) {
        console.warn(`Pitch is not equal to verticalPos for note ${it.pitches[0].pitch}: ${it.lyric[0].syllable}`);
      }

      output.push(`[${it.startChar} - ${it.endChar} - ${it.duration}] ${it.pitches[0].pitch}: ${it.lyric[0].syllable}`)
    });

    expect(output.join("\n")).toBe(
      "[25 - 28 - 0.25] 0: ik\n" +
      "[28 - 29 - 0.125] 1: ben\n" +
      "[29 - 31 - 0.125] 3: \n" +
      "[31 - 34 - 0.25] 2: ge\n" +
      "[34 - 37 - 0.25] 3: test\n" +
      "-------\n" +
      "[38 - 40 - 0.125] 3: of\n" +
      "[40 - 42 - 0.125] 4: niet\n" +
      "[42 - 45 - 0.5] 4: waar ik\n" +
      "[45 - 47 - 0.125] 5: dan\n" +
      "[47 - 49 - 0.125] 6: ook\n" +
      "-------\n" +
      "[50 - 53 - 1] 4: end\n" +
      "=======");
    expect(notes.length).toBe(14);
    expect(notes[0].lyric[0].syllable).toBe("ik");
    expect(notes[1].lyric[0].syllable).toBe("ben");
    expect(notes[2].lyric[0].syllable).toBe("");
    expect(notes[3].lyric[0].syllable).toBe("ge");
    expect(notes[4].lyric[0].syllable).toBe("test");
    expect(notes[8].lyric[0].syllable).toBe("waar ik");
  })

  it("parses abc to song object", () => {
    const data = "X:1\n" +
      "T: this is the title\n" +
      "C2 DF E2 F2 | FG G4 A B | G8|]\n" +
      "w: ik ben_ ge-test of niet waar~ik dan ook end_";

    const song = ABC.parse(data);
    expect(song.referenceNumber).toBe("1");
    expect(song.title).toBe("this is the title");
    expect(song.melody.length).toBe(14);
    expect(song.melody[0].lyric[0].syllable).toBe("ik");
    expect(song.melody[8].lyric[0].syllable).toBe("waar ik");
  })
})
