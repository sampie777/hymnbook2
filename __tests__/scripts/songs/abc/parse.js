import { ABC } from "../../../../source/logic/songs/abc/abc";


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

  it("parses abc with comments to song object", () => {
    const data = "%%vocalfont Arial 14\n" +
      "X:1\n" +
      "T:Psalm 15\n" +
      "C:Wie styg so hoog in heil en eer, ...(5)\n" +
      "L:1/4\n" +
      "M:C|\n" +
      "K:F\n" +
      "Q:1/2=100\n" +
      "yy F2 F F G2 B2 A A G2 z2\n" +
      "%w:words come here\n" +
      "yyyy G2 A B c2 G2 B B A2 G2 z2\n" +
      "%w:words come here\n" +
      "yyyy G2 G G F2 F2 G A B2 z2\n" +
      "%w:words come here\n" +
      "yyyy d2 c B A2 G2 B B A2 z2\n" +
      "%w:words come here\n" +
      "yyyy c2 B G A2 G2 A B G2 F3 yy |]\n" +
      "%w:words come here\n" +
      "w: Wie styg so hoog in heil en eer, dat hy met U, die gro-te Ko-ning, met U, die al-ler-hoog-ste HEER, kan op u heil'-ge berg ver-keer en in-trek in u heil'-ge wo-ning?\n";

    const song = ABC.parse(data);
    expect(song.referenceNumber).toBe("1");
    expect(song.title).toBe("Psalm 15");
    expect(song.melody.length).toBe(67);
    expect(song.melody[2].duration).toBe(0.5);
    expect(song.melody[2].lyric[0].syllable).toBe("Wie");
    expect(song.melody[8].lyric[0].syllable).toBe("en");
    expect(song.keySignature.root).toBe("F");
    expect(song.keySignature.acc).toBe("");
    expect(song.clef.type).toBe("treble");
  })

  it("parses abc with headers to the right beat length with 1/8", () => {
    const data = "%%vocalfont Arial 14\n" +
      "X:1\n" +
      "T:Psalm 15\n" +
      "C:Wie styg so hoog in heil en eer, ...(5)\n" +
      "L:1/4\n" +
      "M:C|\n" +
      "K:F\n" +
      "Q:1/2=100\n" +
      "yy F2 F F G2 B2 A A G2 z2\n" +
      "%w:words come here\n" +
      "yyyy G2 A B c2 G2 B B A2 G2 z2\n" +
      "%w:words come here\n" +
      "yyyy G2 G G F2 F2 G A B2 z2\n" +
      "%w:words come here\n" +
      "yyyy d2 c B A2 G2 B B A2 z2\n" +
      "%w:words come here\n" +
      "yyyy c2 B G A2 G2 A B G2 F3 yy |]\n" +
      "%w:words come here\n" +
      "w: Wie styg so hoog in heil en eer, dat hy met U, die gro-te Ko-ning, met U, die al-ler-hoog-ste HEER, kan op u heil'-ge berg ver-keer en in-trek in u heil'-ge wo-ning?\n";

    const song = ABC.parse(data);
    expect(song.melody.length).toBe(67);
    expect(song.melody[2].duration).toBe(0.5);
  })

  it("parses abc with headers to the right beat length with 1/8", () => {
    const data = "%%vocalfont Arial 14\n" +
      "X:1\n" +
      "T:Psalm 15\n" +
      "C:Wie styg so hoog in heil en eer, ...(5)\n" +
      "L:1/8\n" +
      "M:C|\n" +
      "K:F\n" +
      "Q:1/2=100\n" +
      "yy F2 F F G2 B2 A A G2 z2\n" +
      "%w:words come here\n" +
      "yyyy G2 A B c2 G2 B B A2 G2 z2\n" +
      "%w:words come here\n" +
      "yyyy G2 G G F2 F2 G A B2 z2\n" +
      "%w:words come here\n" +
      "yyyy d2 c B A2 G2 B B A2 z2\n" +
      "%w:words come here\n" +
      "yyyy c2 B G A2 G2 A B G2 F3 yy |]\n" +
      "%w:words come here\n" +
      "w: Wie styg so hoog in heil en eer, dat hy met U, die gro-te Ko-ning, met U, die al-ler-hoog-ste HEER, kan op u heil'-ge berg ver-keer en in-trek in u heil'-ge wo-ning?\n";

    const song = ABC.parse(data);
    expect(song.melody.length).toBe(67);
    expect(song.melody[2].duration).toBe(0.25);
  })

  it("parses abc with fake header codes in text", () => {
    const song = new ABC.Song();
    const data = "X:1\n" +
      "T:Psalm 115\n" +
      "C:Nie aan ons, o troue Heer, ...(9)\n" +
      "L:1/4\n" +
      "M:C|\n" +
      "K:D\n" +
      "Q:1/2=100\n" +
      "r:remark\n" +
      "yy d2 B2 A A B c d2 z2\n" +
      "yyyy A2 B2 A G F2 E2 D2 z2\n" +
      "yyyy D2 F2 E D F ^G A2 z2\n" +
      "yyyy F2 A2 B c d B A2 z2\n" +
      "yyyy A2 =G2 F A G F E2 z2\n" +
      "yyyy E2 F2 A G F2 E2 D3 yy |]\n" +
      "\n" +
      "w: 'K: de van die hei-den-dom, gou-e⁀of-sil-wer-beel-te-nir:, waar die mens sy knie voor krom, niks as ei-e maak-sel is: daar~'s 'n mond, maar son-der taal; daar~'s 'n oog, maar son-der straal.\n";

    expect(ABC.extractInfoFields(data, song)).toBe("yy d2 B2 A A B c d2 z2\n" +
      "yyyy A2 B2 A G F2 E2 D2 z2\n" +
      "yyyy D2 F2 E D F ^G A2 z2\n" +
      "yyyy F2 A2 B c d B A2 z2\n" +
      "yyyy A2 =G2 F A G F E2 z2\n" +
      "yyyy E2 F2 A G F2 E2 D3 yy |]\n" +
      "w: 'K: de van die hei-den-dom, gou-e⁀of-sil-wer-beel-te-nir:, waar die mens sy knie voor krom, niks as ei-e maak-sel is: daar~'s 'n mond, maar son-der taal; daar~'s 'n oog, maar son-der straal.");
  })
})
