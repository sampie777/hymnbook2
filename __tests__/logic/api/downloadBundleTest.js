import { api } from "../../../source/logic/api";
import { Server } from "../../../source/logic/server/server";
import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";

describe("Song bundle download via XMLHttpRequest", () => {
  let originalXHR;
  let mockXHRInstances = [];

  beforeEach(() => {
    mockXHRInstances = [];
    originalXHR = global.XMLHttpRequest;

    global.XMLHttpRequest = jest.fn().mockImplementation(() => {
      const instance = {
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn(),
        status: 200,
        statusText: "OK",
        responseText: "",
        onprogress: null,
        onload: null,
        onerror: null,
        ontimeout: null,
      };
      mockXHRInstances.push(instance);
      return instance;
    });
  });

  afterEach(() => {
    global.XMLHttpRequest = originalXHR;
  });

  it("downloads bundle successfully and reports progress", async () => {
    const bundleData = {
      id: 1,
      uuid: "test-uuid-1",
      name: "Test Bundle",
      songs: [{ id: 10, name: "Song 1" }],
    };

    const progressUpdates = [];
    const downloadPromise = api.songBundles.download("test-uuid-1", (prog) => {
      progressUpdates.push(prog);
    });

    expect(mockXHRInstances.length).toBe(1);
    const xhr = mockXHRInstances[0];

    expect(xhr.open).toHaveBeenCalledWith(
      "GET",
      expect.stringContaining("/songs/bundles/test-uuid-1/download"),
      true
    );
    expect(xhr.setRequestHeader).toHaveBeenCalledWith("Accept", "application/json");

    // Simulate progress
    xhr.onprogress({
      lengthComputable: true,
      loaded: 500,
      total: 1000,
    });
    xhr.onprogress({
      lengthComputable: true,
      loaded: 1000,
      total: 1000,
    });

    // Simulate completion
    xhr.status = 200;
    xhr.responseText = JSON.stringify({
      type: "SUCCESS",
      content: bundleData,
    });
    xhr.onload();

    const result = await downloadPromise;
    expect(result).toEqual(bundleData);
    expect(progressUpdates.length).toBe(2);
    expect(progressUpdates[0]).toEqual({ loaded: 500, total: 1000, percent: 0.5 });
    expect(progressUpdates[1]).toEqual({ loaded: 1000, total: 1000, percent: 1 });
  });

  it("handles numeric bundle ID", async () => {
    const downloadPromise = api.songBundles.download(42);
    const xhr = mockXHRInstances[0];

    expect(xhr.open).toHaveBeenCalledWith(
      "GET",
      expect.stringContaining("/songs/bundles/42/download"),
      true
    );

    xhr.status = 200;
    xhr.responseText = JSON.stringify({
      type: "SUCCESS",
      content: { id: 42, name: "Bundle 42" },
    });
    xhr.onload();

    const result = await downloadPromise;
    expect(result.id).toBe(42);
  });

  it("rejects when network error occurs", async () => {
    const downloadPromise = api.songBundles.download("uuid-err");
    const xhr = mockXHRInstances[0];

    xhr.onerror();

    await expect(downloadPromise).rejects.toThrow("Network request failed");
  });

  it("rejects on server error response", async () => {
    const downloadPromise = api.songBundles.download("uuid-500");
    const xhr = mockXHRInstances[0];

    xhr.status = 500;
    xhr.statusText = "Internal Server Error";
    xhr.responseText = "Server crashed";
    xhr.onload();

    await expect(downloadPromise).rejects.toThrow("Download failed with status 500");
  });

  it("falls back to standard bundle fetch when download endpoint fails in Server", async () => {
    const mockContent = { uuid: "fallback-uuid", name: "Fallback Bundle", songs: [] };
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Map([["content-type", "application/json"]]),
      clone: () => mockResponse,
      json: () => Promise.resolve({
        type: "SUCCESS",
        content: mockContent,
      }),
      text: () => Promise.resolve(JSON.stringify({
        type: "SUCCESS",
        content: mockContent,
      })),
    };

    jest.spyOn(api.songBundles, "download").mockRejectedValueOnce(new Error("Endpoint not found"));
    jest.spyOn(api.songBundles, "get").mockResolvedValueOnce(mockResponse);

    const result = await Server.downloadSongBundleWithProgress({ uuid: "fallback-uuid" });
    expect(result.uuid).toBe("fallback-uuid");
  });
});
