import {describe, expect, it} from '@jest/globals';
import {calculateVerseHeight} from "../../../../source/logic/songs/utils";


describe("test calculation of verse component height in list", () => {
  it("Empty heights and index > 0 gives 0 lengths", () => {
    expect(calculateVerseHeight(1, {})).toStrictEqual({length: 0, offset: 0, index: 1})
  })
  it("Empty heights gives 0 lengths", () => {
    expect(calculateVerseHeight(0, {})).toStrictEqual({length: 0, offset: 0, index: 0})
  })

  it("Index 0 with height gives exact height", () => {
    const verseHeights = {0: 1, 1: 2}
    expect(calculateVerseHeight(0, verseHeights)).toStrictEqual({length: 1, offset: 0, index: 0})
  })
  it("Index 0 with 0 height gives exact height", () => {
    const verseHeights = {0: 0, 1: 1, 2: 2}
    expect(calculateVerseHeight(0, verseHeights)).toStrictEqual({length: 0, offset: 0, index: 0})
  })
  it("Index 0 with no height gives 0 height", () => {
    const verseHeights = {1: 1, 2: 2}
    expect(calculateVerseHeight(0, verseHeights)).toStrictEqual({length: 0, offset: 0, index: 0})
  })
  it("Index 1 with no height gives previous height", () => {
    const verseHeights = {0: 1, 2: 2}
    expect(calculateVerseHeight(1, verseHeights)).toStrictEqual({length: 1, offset: 1, index: 1})
  })
  it("Index 2 with no height gives average height", () => {
    const verseHeights = {0: 1, 1: 2}
    expect(calculateVerseHeight(2, verseHeights)).toStrictEqual({length: 1.5, offset: 3, index: 2})
  })
  it("Index 2 with no height gives average height", () => {
    const verseHeights = {0: 1, 1: 2}
    expect(calculateVerseHeight(2, verseHeights)).toStrictEqual({length: 1.5, offset: 3, index: 2})
  })
  it("Index 2 with height gives exact height", () => {
    const verseHeights = {0: 1, 1: 2, 2: 2}
    expect(calculateVerseHeight(2, verseHeights)).toStrictEqual({length: 2, offset: 3, index: 2})
  })

  it("Index 2 with no previous height gives average offset", () => {
    const verseHeights = {2: 2}
    expect(calculateVerseHeight(2, verseHeights)).toStrictEqual({length: 2, offset: 4, index: 2})
  })
})
