import Db from "../db/db";
import config from "../../config";
import { Song, SongBundle, SongMetadataType, Verse } from "../db/models/songs/Songs";
import { SongSchema } from "../db/models/songs/SongsSchema";
import { rollbar } from "../rollbar";
import { isDbItemValid, languageAbbreviationToFullName, sanitizeErrorForRollbar } from "../utils/utils.ts";
import { AbcMelody } from "../db/models/songs/AbcMelodies";
import { distance } from "fastest-levenshtein";

export enum VerseType {
  Verse,
  PreChorus,
  Chorus,
  Bridge,
  Intro,
  End,
}

export const getVerseType = (verse: Verse): VerseType => {
  if (/^(pre[\-_ ]?chorus)\W?/i.test(verse.name)) {
    return VerseType.PreChorus;
  }
  if (/(chorus|refrein|refrain)\W?/i.test(verse.name)) {
    return VerseType.Chorus;
  }
  if (/(bridge|tussenspel)\W?/i.test(verse.name)) {
    return VerseType.Bridge;
  }
  if (/(intro|inleiding|voorzang)\W?/i.test(verse.name)) {
    return VerseType.Intro;
  }
  if (/(end|slot|outro)\W?/i.test(verse.name)) {
    return VerseType.End;
  }

  return VerseType.Verse;
};

export const getVerseShortName = (name: string): string => name.trim()
  .replace(/(verse|vers) */gi, "")
  .replace(/(pre[\-_ ]?chorus) */gi, "PC")
  .replace(/(chorus|refrein|refrain) */gi, "C")
  .replace(/(bridge|tussenspel) */gi, "B")
  .replace(/(intro|inleiding|voorzang) */gi, "I")
  .replace(/(end|slot|outro) */gi, "E");

// Creates string like "1-3, 5" or "1, 2, 5" or similar based on the selected verses
function generateSongTitleVersesString(selectedVerses: { name: string }[]) {
  const onlyVerses = selectedVerses
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

export const generateSongTitle = (song?: {
                                    name: string,
                                    verses: Verse[],
                                  },
                                  selectedVerses?: { name: string }[]): string => {
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
  if (!isSongValid(item)) return false;

  // Remove any arbitrary information, like song number, 1e/2e beryming, (english), ...
  const stripNameDownToEssentials = (it: string) => it.replace(/ [0-9(\[].*$/g, "").trim();

  const songBundleId = Song.getSongBundle(item)?.id;
  const nameWithoutNumber = stripNameDownToEssentials(item.name);
  const itemId = item.id

  return songs.some(it =>
    isSongValid(it)
    && it.id !== itemId
    && Song.getSongBundle(it)?.id !== songBundleId
    // Names are the same if there's at max only 1 character different
    && distance(nameWithoutNumber, stripNameDownToEssentials(it.name)) <= 1
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
  } catch (error) {
    rollbar.error(`Failed to determine if song has displayable melody`, {
      ...sanitizeErrorForRollbar(error),
      song: song
    });
    return false;
  }
  return true;
};

export const loadSongWithUuidOrId = (uuid?: string, id?: number): (Song & Realm.Object<Song>) | undefined => {
  if (uuid == "") uuid = undefined;

  if (uuid == undefined && id == undefined) {
    return undefined;
  }

  if (!Db.songs.isConnected()) {
    return undefined;
  }

  let query = `uuid = "${uuid}" OR id = ${id}`;
  if (id == undefined) query = `uuid = "${uuid}"`;
  if (uuid == undefined) query = `id = "${id}"`;

  const songs = Db.songs.realm().objects<Song>(SongSchema.name)
    .filtered(query);

  if (songs.length == 0) return undefined;
  if (songs.length > 1) {
    rollbar.warning("Multiple songs found for UUID and ID search", {
      uuid: uuid ?? (uuid === null ? "null" : "undefined"),
      id: id ?? (id === null ? "null" : "undefined"),
      songs: songs.map(it => ({ name: it.name, id: it.id, uuid: it.uuid }))
    });
  }

  return songs[0];
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

export const createHeader = (song?: Song) => {
  if (song === undefined) {
    return "";
  }

  const result: string[] = [];

  song.metadata.filter(it => it.type === SongMetadataType.Superscription)
    .map(it => result.push(it.value));

  return result.filter(it => it.length > 0).join("\n").trim();
};

export const createCopyright = (song?: Song): string[] => {
  if (song === undefined) {
    return [];
  }

  const result: string[] = [];
  const songBundle = Song.getSongBundle(song);
  const songHasAuthor = song.metadata.some(it => it.type === SongMetadataType.Author);
  const songHasCopyright = song.metadata.some(it => it.type === SongMetadataType.Copyright);

  song.metadata.filter(it => it.type === SongMetadataType.AlternativeTitle)
    .map(it => result.push(it.value));
  song.metadata.filter(it => it.type === SongMetadataType.TextSource)
    .map(it => result.push(it.value));
  song.metadata.filter(it => it.type === SongMetadataType.ScriptureReference)
    .map(it => result.push(it.value));
  song.metadata.filter(it => it.type === SongMetadataType.Year)
    .map(it => result.push(it.value));

  if (songHasAuthor) {
    song.metadata.filter(it => it.type === SongMetadataType.Author)
      .map(it => result.push(it.value));
  }

  if (songHasCopyright) {
    song.metadata.filter(it => it.type === SongMetadataType.Copyright)
      .map(it => result.push(it.value));
  }

  if (isSongLanguageDifferentFromSongBundle(song, songBundle)) {
    result.push(languageAbbreviationToFullName(song.language));
  }

  // Add song bundle info
  if (songBundle !== undefined) {
    result.push(songBundle.name);
    if (!songHasAuthor) result.push(songBundle.author);
    if (!songHasCopyright) result.push(songBundle.copyright);
  }

  return result.filter(it => it.length > 0);
};

export const getDefaultMelody = (song?: Song): AbcMelody | undefined => {
  if (song === undefined) return undefined;

  if (!song?.abcMelodies || song.abcMelodies.length === 0)
    return undefined;

  if (song.abcMelodies.length === 1)
    return song.abcMelodies[0];

  if (song.lastUsedMelody != null && song.abcMelodies.some(it => it.id == song.lastUsedMelody?.id))
    return song.lastUsedMelody;

  const defaultMelody = song.abcMelodies.find(it => it.name == config.defaultMelodyName);
  return defaultMelody ? defaultMelody : song.abcMelodies[0];
};

export const storeLastUsedMelody = (song: Song, melody?: AbcMelody) => {
  const dbSong = Db.songs.realm().objectForPrimaryKey<Song>(SongSchema.name, song.id);
  if (!dbSong) return;

  const dbMelody = dbSong.abcMelodies.find(it => it.id == melody?.id);
  Db.songs.realm().write(() => {
    dbSong.lastUsedMelody = dbMelody;
  });
}

export const calculateVerseHeight = (index: number, verseHeights: Record<number, number>): {
  length: number;
  offset: number;
  index: number
} => {
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
    .filter(([key]) => +key < index)
    .forEach(([, value]) => {
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

export const isSongValid = (song: unknown) => isDbItemValid(song)

export const generateVerseContentWithCorrectWidth = (
  content: string,
  maxWidth: number,
  textLinesWidths: {
    text: string,
    width: number
  }[]) => {
  if (maxWidth == 0) return content;
  if (textLinesWidths.length == 0) return content;

  let lastTextWidthIndex = -1;

  return content
    .split("\n")
    .map(line => {
      lastTextWidthIndex = textLinesWidths
        .findIndex((it, index) => index >= lastTextWidthIndex && line.startsWith(it.text.trim()))

      const textWidth = textLinesWidths[lastTextWidthIndex];
      return line + (textWidth != undefined && textWidth.width < maxWidth ? "" : "\r");
    })
    .join("\n");
}