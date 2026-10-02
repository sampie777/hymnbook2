import {
  calculateLocalDocumentGroupSize,
  calculateLocalSongBundleSize,
  formatDocumentGroupDownloadSize,
  formatSongBundleDownloadSize,
  fetchSongBundleDownloadSize,
  getCachedSongBundleDownloadSize,
  clearDownloadSizeCache
} from "../../../../source/gui/screens/downloads/downloadSize";
import { api } from "../../../../source/logic/api";
import { describe, expect, it, beforeEach, jest } from "@jest/globals";

describe("downloadSize", () => {
  beforeEach(() => {
    clearDownloadSizeCache();
    jest.restoreAllMocks();
  });

  describe("calculateLocalSongBundleSize", () => {
    it("calculates total byte size of songs, verses, and melodies", () => {
      const bundle = {
        name: "Test Bundle",
        abbreviation: "TB",
        songs: [
          {
            name: "Song 1",
            verses: [
              { content: "Verse content 1", abcContent: "X:1" }
            ],
            abcMelodies: [
              { melody: "X:1 notes" }
            ]
          }
        ]
      };
      const size = calculateLocalSongBundleSize(bundle);
      expect(size).toBeGreaterThan(0);
    });

    it("returns 0 if bundle has no songs", () => {
      const bundle = { songs: [] };
      expect(calculateLocalSongBundleSize(bundle)).toBe(0);
    });
  });

  describe("formatSongBundleDownloadSize", () => {
    it("formats local bundle size when local exists", () => {
      const localBundle = {
        name: "Local Bundle",
        songs: [
          {
            name: "Song 1",
            verses: [{ content: "Some lyrics content" }]
          }
        ]
      };
      const formatted = formatSongBundleDownloadSize(undefined, localBundle);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted.startsWith("~")).toBe(false);
    });

    it("formats exact remote byte size when available", () => {
      const serverBundle = { size: 100 };
      const formatted = formatSongBundleDownloadSize(serverBundle, undefined, 954514);
      expect(formatted).toBeDefined();
      expect(formatted.startsWith("~")).toBe(false);
      expect(formatted).toContain("955 kB");
    });

    it("formats estimated server bundle size when only server exists without exact bytes", () => {
      const serverBundle = {
        size: 100
      };
      const formatted = formatSongBundleDownloadSize(serverBundle, undefined);
      expect(formatted).toBeDefined();
      expect(formatted.startsWith("~")).toBe(true);
      expect(formatted).toContain("kB");
    });

    it("returns undefined if no bundle provided", () => {
      expect(formatSongBundleDownloadSize(undefined, undefined)).toBeUndefined();
    });
  });

  describe("calculateLocalDocumentGroupSize", () => {
    it("calculates total byte size of items, content, and sub-groups", () => {
      const group = {
        name: "Group 1",
        items: [
          {
            name: "Item 1",
            content: "Some markdown document content"
          }
        ],
        groups: [
          {
            name: "Sub Group",
            items: [{ name: "Sub Item", content: "Sub content" }]
          }
        ]
      };
      const size = calculateLocalDocumentGroupSize(group);
      expect(size).toBeGreaterThan(0);
    });
  });

  describe("formatDocumentGroupDownloadSize", () => {
    it("formats local group size when local exists", () => {
      const localGroup = {
        name: "Local Group",
        items: [{ name: "Item", content: "Doc text" }]
      };
      const formatted = formatDocumentGroupDownloadSize(undefined, localGroup);
      expect(formatted).toBeDefined();
      expect(formatted.startsWith("~")).toBe(false);
    });

    it("formats estimated server group size when only server exists", () => {
      const serverGroup = {
        size: 50
      };
      const formatted = formatDocumentGroupDownloadSize(serverGroup, undefined);
      expect(formatted).toBeDefined();
      expect(formatted.startsWith("~")).toBe(true);
      expect(formatted).toContain("kB");
    });
  });

  describe("caching and fetching download sizes", () => {
    it("fetches and caches song bundle download size", async () => {
      jest.spyOn(api.songBundles, "getDownloadSize").mockResolvedValueOnce(954514);

      expect(getCachedSongBundleDownloadSize("bundle-1")).toBeUndefined();

      const size = await fetchSongBundleDownloadSize("bundle-1");
      expect(size).toBe(954514);
      expect(getCachedSongBundleDownloadSize("bundle-1")).toBe(954514);

      // Second call uses cache
      const cached = await fetchSongBundleDownloadSize("bundle-1");
      expect(cached).toBe(954514);
      expect(api.songBundles.getDownloadSize).toHaveBeenCalledTimes(1);
    });
  });
});
