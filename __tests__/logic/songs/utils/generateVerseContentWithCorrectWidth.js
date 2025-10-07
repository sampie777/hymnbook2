import {describe, expect, it} from '@jest/globals';
import {generateVerseContentWithCorrectWidth} from "../../../../source/logic/songs/utils";

describe("generateVerseContentWithCorrectWidth", () => {
  it("adds a \\r character too the long lines", () => {
    const content = "Okay, so when evaluating\n" +
      "the width data from\n" +
      "it is clear that some lines have a larger width";
    const maxWidth = 200;
    const lineWidths = [
      {text: "Okay, so when evaluating", width: 100},
      {text: "the width data from", width: 100},
      {text: "it is clear that some lines have a larger width", width: 210},
    ]
    expect(generateVerseContentWithCorrectWidth(content, maxWidth, lineWidths))
      .toBe(
        "Okay, so when evaluating\n" +
        "the width data from\n" +
        "it is clear that some lines have a larger width\r")
  })

  it("detects split lines", () => {
    const content = "Okay, so when evaluating\n" +
      "the width data from\n" +
      "it is clear that some lines have a larger width";
    const maxWidth = 200;
    const lineWidths = [
      {text: "Okay, so when evaluating", width: 100},
      {text: "the width ", width: 50},
      {text: "data from", width: 50},
      {text: "it is clear that some lines ", width: 210},
      {text: "have a larger width", width: 100},
    ]
    expect(generateVerseContentWithCorrectWidth(content, maxWidth, lineWidths))
      .toBe(
        "Okay, so when evaluating\n" +
        "the width data from\n" +
        "it is clear that some lines have a larger width\r")
  })
})