import { describe, expect, it, jest } from "@jest/globals";
import { MelodyTextAlignment } from "../../../../source/logic/songs/abc/utils";
import {
  computeLayout,
  createClefItem,
  mapVoiceItem,
  MeasuredItem,
  ScoreItem,
} from "../../../../source/gui/components/melody/skiaMelodyLayout";

jest.mock("@shopify/react-native-skia", () => ({
  Skia: {
    PathBuilder: {
      Make: () => ({
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        build: jest.fn(() => ({})),
      }),
    },
  },
}));

const makeMeasured = (item: ScoreItem, noteWidth = 10): MeasuredItem => ({
  item,
  noteWidth,
  lyricWidth: 0,
  chordWidth: 0,
  contentWidth: noteWidth,
});

const mockFont = {
  measureText: (text: string) => ({ width: text.length * 8 }),
} as any;

describe("skiaMelodyLayout trailing bar alignment", () => {
  const clefItem = createClefItem({ clef: { type: "treble" } } as any);
  const noteItem = mapVoiceItem({
    el_type: "note",
    duration: 0.25,
    pitches: [{ pitch: 0 }],
  } as any);
  const thinBarItem = mapVoiceItem({
    el_type: "bar",
    type: "bar_thin",
  } as any);
  const endBarItem = mapVoiceItem({
    el_type: "bar",
    type: "bar_thin_thick",
  } as any);

  it("pins a thin bar '|' at the end of a non-last row and a '|]' bar on the last row to rightBound", () => {
    const effectiveWidth = 300;
    const horizontalMargin = 10;
    const rightBound = effectiveWidth + horizontalMargin;

    const rows: MeasuredItem[][] = [
      [makeMeasured(clefItem, 20), makeMeasured(noteItem, 12), makeMeasured(thinBarItem, 4)],
      [makeMeasured(noteItem, 12), makeMeasured(endBarItem, 10)],
    ];

    const { positions } = computeLayout(
      rows,
      effectiveWidth,
      1,
      false,
      MelodyTextAlignment.Left,
      clefItem,
      mockFont,
      horizontalMargin
    );

    const row1Bar = positions[2];
    const row2Bar = positions[4];

    expect(row1Bar.char).toBe("Ā");
    expect(row1Bar.xNote).toBe(rightBound - 4);

    expect(row2Bar.char).toBe(".");
    expect(row2Bar.xNote).toBe(rightBound - 10);
  });

  it("keeps a thin bar '|' in the middle of a row inline rather than pinning it to rightBound", () => {
    const effectiveWidth = 300;
    const horizontalMargin = 10;
    const rightBound = effectiveWidth + horizontalMargin;

    const rows: MeasuredItem[][] = [
      [makeMeasured(clefItem, 20), makeMeasured(noteItem, 12), makeMeasured(thinBarItem, 4), makeMeasured(noteItem, 12)],
    ];

    const { positions } = computeLayout(
      rows,
      effectiveWidth,
      1,
      false,
      MelodyTextAlignment.Left,
      clefItem,
      mockFont,
      horizontalMargin
    );

    const midBar = positions[2];
    const trailingNote = positions[3];

    expect(midBar.char).toBe("Ā");
    expect(midBar.xNote).toBeLessThan(trailingNote.xNote);
    expect(midBar.xNote).toBeLessThan(rightBound - 50);
  });

  it("pins a trailing thin bar '|' on the last row when using Center alignment", () => {
    const effectiveWidth = 300;
    const horizontalMargin = 10;
    const rightBound = effectiveWidth + horizontalMargin;

    const rows: MeasuredItem[][] = [
      [makeMeasured(clefItem, 20), makeMeasured(noteItem, 12), makeMeasured(thinBarItem, 4)],
    ];

    const { positions } = computeLayout(
      rows,
      effectiveWidth,
      1,
      false,
      MelodyTextAlignment.Center,
      clefItem,
      mockFont,
      horizontalMargin
    );

    const trailingBar = positions[2];
    expect(trailingBar.char).toBe("Ā");
    expect(trailingBar.xNote).toBe(rightBound - 4);
  });
});
