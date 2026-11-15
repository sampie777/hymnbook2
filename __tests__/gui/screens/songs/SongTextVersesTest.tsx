import React from "react";
import { describe, expect, it } from "@jest/globals";
import TestRenderer from "react-test-renderer";
import SongTextVerses from "../../../../source/gui/screens/songs/song/SongTextVerses";
import { Verse } from "../../../../source/logic/db/models/songs/Songs";
import ThemeProvider from "../../../../source/gui/components/providers/ThemeProvider";

describe("SongTextVerses", () => {
  const dummyVerses: Verse[] = [
    {
      id: 1,
      uuid: "uuid-1",
      name: "1",
      content: "Verse 1 line 1\nVerse 1 line 2",
      language: "en",
      index: 0,
      _song: null as any
    },
    {
      id: 2,
      uuid: "uuid-2",
      name: "chorus",
      content: "Chorus line 1\nChorus line 2",
      language: "en",
      index: 1,
      _song: null as any
    }
  ];

  it("renders all verses into text elements", () => {
    const scale = { value: 1.0 } as any;
    let renderer: any;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <SongTextVerses
            verses={dummyVerses}
            scale={scale}
            selectedVerses={[]}
          />
        </ThemeProvider>
      );
    });

    const root = renderer.root;
    expect(root).toBeDefined();
    const texts = root.findAllByType("Text" as any);
    expect(texts.length).toBeGreaterThan(0);
  });
});
