import {
  calculateLocalDocumentGroupSize,
  calculateLocalSongBundleSize,
  formatDocumentGroupDownloadSize,
  formatSongBundleDownloadSize
} from "../../../../source/gui/screens/downloads/downloadSize";

describe("downloadSize", () => {
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

    it("formats estimated server bundle size when only server exists", () => {
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
});
