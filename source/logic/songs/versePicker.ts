import { ScaledSize } from "react-native";
import { VerseProps } from "../db/models/songs/Songs";

export interface getMarginForVersesConfig {
  minMargin?: number;
  itemsPerRow?: number;
}

export const getMarginForVerses = (window: ScaledSize,
                                   listPadding: number,
                                   verseWidth: number,
                                   {
                                     minMargin = 7,
                                     itemsPerRow = 5
                                   }: getMarginForVersesConfig = {}): number => {
  const getMarginForAmountOfItems = (itemsPerRow: number) => {
    const spacePerItem = (Math.floor(window.width) - listPadding * 2) / itemsPerRow;
    return (spacePerItem - verseWidth) / 2;
  };

  const margin = getMarginForAmountOfItems(itemsPerRow);

  if (margin < minMargin) {
    return minMargin;
  }

  // Check if we can fit more items in the lost space of the margin
  if (2 * margin + verseWidth >= 2 * (verseWidth + 2 * minMargin)) {
    return getMarginForVerses(window, listPadding, verseWidth,
      { minMargin: minMargin, itemsPerRow: 2 * itemsPerRow });
  }
  return margin;
};

export const isVerseInList = (verses: Array<VerseProps>, verse: VerseProps): boolean => {
  return verses.some(it => it.id === verse.id);
};

export const toggleVerseInList = (verses: Array<VerseProps>, verse: VerseProps): Array<VerseProps> => {
  let newSelection: Array<VerseProps>;
  if (isVerseInList(verses, verse)) {
    newSelection = verses.filter(it => it.id !== verse.id);
  } else {
    newSelection = verses.concat(verse);
  }

  newSelection = newSelection.sort((a, b) => a.index - b.index);
  return newSelection;
};

export const clearOrSelectAll = (selectedVerses: Array<VerseProps>, allVerses: Array<VerseProps>) => {
  if (selectedVerses.length > 0) {
    return [];
  }
  return allVerses;
};

export const hasVisibleNameForPicker = (verse: VerseProps) => verse.name.replace(/verse/gi, "").trim() !== "";

export const cleanSelectedVerses = (data: VerseProps[], pool: VerseProps[]) => data.filter(selected => pool.some(it => it.id == selected.id));