import { readableFileSizeSI } from "../../../logic/utils/utils";
import { SongBundle as LocalSongBundle } from "../../../logic/db/models/songs/Songs";
import { DocumentGroup as LocalDocumentGroup } from "../../../logic/db/models/documents/Documents";

export const calculateLocalSongBundleSize = (bundle: LocalSongBundle): number => {
  let bytes = 0;
  if (bundle.name) bytes += bundle.name.length;
  if (bundle.abbreviation) bytes += bundle.abbreviation.length;
  if (bundle.author) bytes += bundle.author.length;
  if (bundle.copyright) bytes += bundle.copyright.length;
  if (bundle.songs) {
    for (const song of bundle.songs) {
      if (song.name) bytes += song.name.length;
      if (song.verses) {
        for (const verse of song.verses) {
          if (verse.name) bytes += verse.name.length;
          if (verse.content) bytes += verse.content.length;
        }
      }
      if (song.abcMelodies) {
        for (const melody of song.abcMelodies) {
          if (melody.name) bytes += melody.name.length;
          if (melody.melody) bytes += melody.melody.length;
        }
      }
    }
  }
  return bytes;
};

export const formatSongBundleDownloadSize = (
  bundle?: { size?: number } | null,
  localBundle?: LocalSongBundle | null
): string | undefined => {
  if (localBundle) {
    const bytes = calculateLocalSongBundleSize(localBundle);
    if (bytes > 0) return readableFileSizeSI(bytes);
  }
  const songCount = bundle?.size ?? localBundle?.songs?.length;
  if (songCount !== undefined && songCount > 0) {
    // Average json payload per song is ~1.85 kB (JSON metadata, multiple verses, ABC melodies)
    return `~${readableFileSizeSI(Math.round(songCount * 1850))}`;
  }
  return undefined;
};

export const calculateLocalDocumentGroupSize = (group: LocalDocumentGroup): number => {
  let bytes = 0;
  if (group.name) bytes += group.name.length;
  if (group.items) {
    for (const item of group.items) {
      if (item.name) bytes += item.name.length;
      if (item.html) bytes += item.html.length;
    }
  }
  if (group.groups) {
    for (const subGroup of group.groups) {
      bytes += calculateLocalDocumentGroupSize(subGroup);
    }
  }
  return bytes;
};

export const formatDocumentGroupDownloadSize = (
  group?: { size?: number } | null,
  localGroup?: LocalDocumentGroup | null
): string | undefined => {
  if (localGroup) {
    const bytes = calculateLocalDocumentGroupSize(localGroup);
    if (bytes > 0) return readableFileSizeSI(bytes);
  }
  const docCount = group?.size ?? localGroup?.size;
  if (docCount !== undefined && docCount > 0) {
    // Average document size is ~3.5 kB (HTML formatting, title)
    return `~${readableFileSizeSI(Math.round(docCount * 3500))}`;
  }
  return undefined;
};
