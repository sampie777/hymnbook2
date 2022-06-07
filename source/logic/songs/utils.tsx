import Db from "../db/db";
import Settings from "../../settings";
import { Song, SongBundle, Verse, VerseProps } from "../db/models/Songs";
import { SongSchema } from "../db/models/SongsSchema";

export enum VerseType {
  Verse,
  Chorus,
  Bridge,
  Intro,
  End,
}

export const getVerseType = (verse: Verse): VerseType => {
  if (verse.name.match(/chorus\W?/gi)) {
    return VerseType.Chorus;
  }
  if (verse.name.match(/bridge\W?/gi)) {
    return VerseType.Bridge;
  }
  if (verse.name.match(/intro\W?/gi)) {
    return VerseType.Intro;
  }
  if (verse.name.match(/end\W?/gi)) {
    return VerseType.End;
  }

  return VerseType.Verse;
};

// Creates string like "1-3, 5" or "1, 2, 5" or similar based on the selected verses
function generateSongTitleVersesString(selectedVerses: Array<Verse>) {
  const onlyVerses = (selectedVerses as Array<VerseProps>)
    .filter(it => it.name.toLowerCase().includes("verse"))
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
  if (song === undefined || song === null) {
    return "";
  }

  if (selectedVerses === undefined || selectedVerses === null || selectedVerses.length === 0) {
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
  if (!Settings.showMelody) {
    return false;
  }

  if (song === undefined) {
    return false;
  }

  if (!song.verses.some(it => it.abcLyrics)) {
    return false;
  }

  if (song.abcMelody) {
    return true;
  }

  return song.verses.some(it => it.abcLyrics && it.abcMelody);
};

export const loadSongWithId = (id?: number): Song & Realm.Object | undefined => {
  if (!Db.songs.isConnected()) {
    return;
  }

  if (id === undefined) {
    return undefined;
  }

  return Db.songs.realm()
    .objectForPrimaryKey(SongSchema.name, id) as (Song & Realm.Object | undefined);
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
