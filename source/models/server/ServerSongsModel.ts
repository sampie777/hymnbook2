export class SongVerse {
  id: number;
  name: string;
  content: string;
  language: string;
  index: number;
  song: Song | null;
  abcMelody?: string;
  abcLyrics?: string;

  constructor(
    id: number,
    name: string,
    content: string,
    language: string,
    index: number,
    song: Song | null,
    abcMelody?: string,
    abcLyrics?: string,
  ) {
    this.id = id;
    this.name = name;
    this.content = content;
    this.language = language;
    this.index = index;
    this.song = song;
    this.abcMelody = abcMelody;
    this.abcLyrics = abcLyrics;
  }
}

export class Song {
  id: number;
  name: string;
  number?: number;
  author: string;
  copyright: string;
  language: string;
  verses: Array<SongVerse> | null;
  songBundle: SongBundle | null;
  createdAt: string;
  modifiedAt: string;
  abcMelody?: string;

  constructor(
    id: number,
    name: string,
    author: string,
    copyright: string,
    language: string,
    verses: Array<SongVerse> | null,
    songBundle: SongBundle | null,
    createdAt: string,
    modifiedAt: string,
    number?: number,
    abcMelody?: string,
  ) {
    this.id = id;
    this.name = name;
    this.number = number;
    this.author = author;
    this.copyright = copyright;
    this.language = language;
    this.verses = verses;
    this.songBundle = songBundle;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.abcMelody = abcMelody;
  }
}

export class SongBundle {
  id: number;
  abbreviation: string;
  name: string;
  language: string;
  songs: Array<Song> | null;
  size?: number;
  createdAt: string;
  modifiedAt: string;

  constructor(id: number,
              abbreviation: string,
              name: string,
              language: string,
              songs: Array<Song> | null,
              createdAt: string,
              modifiedAt: string,
              size?: number
  ) {
    this.id = id;
    this.abbreviation = abbreviation;
    this.name = name;
    this.language = language;
    this.songs = songs;
    this.size = size;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
  }
}
