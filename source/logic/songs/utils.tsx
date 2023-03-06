import Db from "../db/db";
import { Song, SongBundle, Verse, VerseProps } from "../db/models/Songs";
import { SongSchema } from "../db/models/SongsSchema";
import { rollbar } from "../rollbar";
import { languageAbbreviationToFullName } from "../utils";
import { AbcMelody } from "../db/models/AbcMelodies";

export enum VerseType {
  Verse,
  Chorus,
  Bridge,
  Intro,
  End,
}

export const getVerseType = (verse: Verse): VerseType => {
  if (/(chorus|refrein|refrain)\W?/i.test(verse.name)) {
    return VerseType.Chorus;
  }
  if (/bridge|tussenspel\W?/i.test(verse.name)) {
    return VerseType.Bridge;
  }
  if (/(intro|inleiding)\W?/i.test(verse.name)) {
    return VerseType.Intro;
  }
  if (/(end|slot|outro)\W?/i.test(verse.name)) {
    return VerseType.End;
  }

  return VerseType.Verse;
};

// Creates string like "1-3, 5" or "1, 2, 5" or similar based on the selected verses
function generateSongTitleVersesString(selectedVerses: Array<Verse>) {
  const onlyVerses = (selectedVerses as Array<VerseProps>)
    .filter(it => /verse/i.test(it.name))
    .map(it => it.name.replace(/verse */gi, ""));

  if (onlyVerses.length === 0) {
    return "";
  }

  // Create array with only the verses that needs to be displayed
  // by looking at the previous added verses in the same array
  const displayTheseVerses: Array<String> = [];
  onlyVerses.forEach(it => {
    const currentNumber = +it;
    if (isNaN(currentNumber)) {
      displayTheseVerses.push(it);
      return;
    }

    if (displayTheseVerses.length < 2) {
      displayTheseVerses.push(it);
      return;
    }

    const lastAddedVerse = displayTheseVerses[displayTheseVerses.length - 1];
    const lastAddedNumber = +lastAddedVerse;
    const secondLastAddedVerse = displayTheseVerses[displayTheseVerses.length - 2];
    const secondLastAddedNumber = +secondLastAddedVerse;

    if (isNaN(lastAddedNumber) || (isNaN(secondLastAddedNumber) && secondLastAddedVerse !== "-")) {
      displayTheseVerses.push(it);
      return;
    }

    // Check if we are already in a squeeze-series
    if (secondLastAddedVerse === "-") {
      // Check if the current number is part of the squeeze-series
      if (lastAddedNumber + 1 === currentNumber) {
        // If so, replace the end number of the series with the new end number ("1-<endNumber>")
        displayTheseVerses.pop();
        displayTheseVerses.push(it);
        return;
      }

      displayTheseVerses.push(it);
      return;
    }

    // Check if we can start a new squeeze-series
    if (lastAddedNumber + 1 === currentNumber && secondLastAddedNumber + 2 === currentNumber) {
      displayTheseVerses.pop();
      displayTheseVerses.push("-");
      displayTheseVerses.push(it);
      return;
    }

    displayTheseVerses.push(it);
  });

  // Now combine the selected verses for display to a representable string
  // by adding commas in the correct places
  return displayTheseVerses.reduce((result, currentValue) => {
    const it = currentValue.toString();
    if (it === "-") {
      return result + it;
    }

    if (result.length === 0) {
      return result + it;
    }

    if (result[result.length - 1] === "-") {
      return result + it;
    }

    return result + ", " + it;
  });
}

export const generateSongTitle = (song?: Song, selectedVerses?: Array<Verse>): string => {
  if (song == null) {
    return "";
  }

  if (selectedVerses == null
    || selectedVerses.length === 0
    || selectedVerses.length === song.verses.length) {
    return song.name;
  }

  const verseString = generateSongTitleVersesString(selectedVerses);
  if (verseString.length === 0) {
    return song.name;
  }

  return song.name + ": " + verseString;
};

export const getNextVerseIndex = (verses: Array<Verse>, currentIndex: number) => {
  if (currentIndex === -1) {
    return -1;
  }

  if (verses.length === 0) {
    return -1;
  }

  // Get current verse
  let currentVerseIndex = verses.findIndex(it => it.index === currentIndex);

  if (currentVerseIndex < 0) {
    // Else, get previous verse
    const previousVerses = verses.filter(it => it.index <= currentIndex);

    if (previousVerses.length > 0) {
      const latestVerse = previousVerses[previousVerses.length - 1];
      currentVerseIndex = verses.indexOf(latestVerse);
    }
    // Else, leave index to -1, as it will be incremented later on
  }

  if (currentVerseIndex + 1 === verses.length) {
    return -1;
  }

  const nextVerse = verses[currentVerseIndex + 1];
  return nextVerse.index;
};

export const isTitleSimilarToOtherSongs = (item: Song, songs: Song[]): boolean => {
  const firstWord = item.name.split(" ")[0];
  const songBundle = Song.getSongBundle(item);
  return songs.some(it =>
    it.id !== item.id
    && Song.getSongBundle(it)?.id !== songBundle?.id
    && it.name.startsWith(firstWord)
  );
};

export const hasMelodyToShow = (song?: Song) => {
  if (song === undefined) {
    return false;
  }

  try {
    if (song.abcMelodies.length === 0) {
      return false;
    }

    if (!song.verses.some(it => it.abcLyrics)) {
      return false;
    }
  } catch (e: any) {
    rollbar.error(`Failed to determine if song (${song.name}) has displayable melody: ${e}`, e);
    return false;
  }
  return true;
};

export const loadSongWithId = (id?: number): Song & Realm.Object | undefined => {
  if (!Db.songs.isConnected()) {
    return;
  }

  if (id === undefined) {
    return undefined;
  }

  return Db.songs.realm().objectForPrimaryKey(SongSchema.name, id) ?? undefined;
};

export const isSongLanguageDifferentFromSongBundle = (song?: Song, bundle?: SongBundle): boolean => {
  if (song === undefined || bundle === undefined) {
    return false;
  }
  if (song.language.length === 0 || bundle.language.length === 0) {
    return false;
  }
  return song.language !== bundle.language;
};

export const createCopyright = (song?: Song) => {
  if (song === undefined) {
    return "";
  }

  let result = "";
  let author = song.author;
  let copyright = song.copyright;

  const songBundle = Song.getSongBundle(song);
  if (songBundle !== undefined) {
    result += songBundle.name + "\n";
    if (author.length === 0) author = songBundle.author;
    if (copyright.length === 0) copyright = songBundle.copyright;
  }

  result += author.length === 0 ? "" : author + "\n";
  result += copyright.length === 0 ? "" : copyright + "\n";

  if (isSongLanguageDifferentFromSongBundle(song, songBundle)) {
    result += languageAbbreviationToFullName(song.language);
  }

  return result.trim();
};

export const getDefaultMelody = (song?: Song): AbcMelody | undefined => {
  if (song === undefined) return undefined;

  if (!song?.abcMelodies || song.abcMelodies.length === 0)
    return undefined;

  if (song.abcMelodies.length === 1)
    return song.abcMelodies[0];

  if (song.lastUsedMelody != null && song.abcMelodies.some(it => it.id == song.lastUsedMelody?.id))
    return song.lastUsedMelody;

  const defaultMelody = song.abcMelodies.find(it => it.name == "Default");
  return defaultMelody ? defaultMelody : song.abcMelodies[0];
};

export const calculateVerseHeight = (index: number, verseHeights: Record<number, number>): { length: number; offset: number; index: number } => {
  if (Object.keys(verseHeights).length == 0) {
    return {
      length: 0,
      offset: 0,
      index: index
    };
  }

  if (index == 0 && verseHeights[index] > 0) {
    return {
      length: verseHeights[index],
      offset: 0,
      index: index
    };
  }

  let totalHeight = 0;
  let count = 0;
  Object.entries(verseHeights)
    .filter(([key, value]) => +key < index)
    .forEach(([key, value]) => {
      totalHeight += value;
      count++;
    });
  let averageHeight = count == 0 ? (totalHeight || verseHeights[index] || 0) : totalHeight / count;

  return {
    length: verseHeights[index] || averageHeight,
    offset: averageHeight * index,
    index: index
  };
};
