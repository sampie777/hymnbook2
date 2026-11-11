import React from "react";
import { describe, expect, it } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import { Text } from "react-native";
import UpdaterContextProvider, { UpdaterContextProps, useUpdaterContext } from "../../../source/gui/components/providers/UpdaterContextProvider";

describe("UpdaterContextProvider", () => {
  it("handles concurrent additions and removals without stale closure corruption", () => {
    let capturedContext!: UpdaterContextProps;

    const TestConsumer = () => {
      capturedContext = useUpdaterContext();
      return <Text>{capturedContext.songBundlesUpdating.length}</Text>;
    };

    act(() => {
      TestRenderer.create(
        <UpdaterContextProvider>
          <TestConsumer />
        </UpdaterContextProvider>
      );
    });

    expect(capturedContext.songBundlesUpdating).toEqual([]);
    expect(capturedContext.documentGroupsUpdating).toEqual([]);

    // Capture functions from initial render (simulating closures like AutoUpdater.run)
    const initialAddSongBundle = capturedContext.addSongBundleUpdating;
    const initialRemoveSongBundle = capturedContext.removeSongBundleUpdating;
    const initialAddDocumentGroup = capturedContext.addDocumentGroupUpdating;
    const initialRemoveDocumentGroup = capturedContext.removeDocumentGroupUpdating;

    // Concurrently add multiple items using the captured functions in a single act
    act(() => {
      initialAddSongBundle({ uuid: "bundle-1" });
      initialAddSongBundle({ uuid: "bundle-2" });
      initialAddSongBundle({ uuid: "bundle-3" });
      initialAddDocumentGroup({ uuid: "group-1" });
      initialAddDocumentGroup({ uuid: "group-2" });
    });

    expect(capturedContext.songBundlesUpdating).toEqual([
      { uuid: "bundle-1" },
      { uuid: "bundle-2" },
      { uuid: "bundle-3" },
    ]);
    expect(capturedContext.documentGroupsUpdating).toEqual([
      { uuid: "group-1" },
      { uuid: "group-2" },
    ]);

    // Adding an already existing item shouldn't duplicate it
    act(() => {
      initialAddSongBundle({ uuid: "bundle-2" });
      initialAddDocumentGroup({ uuid: "group-1" });
    });

    expect(capturedContext.songBundlesUpdating).toEqual([
      { uuid: "bundle-1" },
      { uuid: "bundle-2" },
      { uuid: "bundle-3" },
    ]);
    expect(capturedContext.documentGroupsUpdating).toEqual([
      { uuid: "group-1" },
      { uuid: "group-2" },
    ]);

    // Concurrently remove and add items using initial captured functions
    act(() => {
      initialRemoveSongBundle({ uuid: "bundle-1" });
      initialAddSongBundle({ uuid: "bundle-4" });
      initialRemoveDocumentGroup({ uuid: "group-2" });
      initialAddDocumentGroup({ uuid: "group-3" });
    });

    expect(capturedContext.songBundlesUpdating).toEqual([
      { uuid: "bundle-2" },
      { uuid: "bundle-3" },
      { uuid: "bundle-4" },
    ]);
    expect(capturedContext.documentGroupsUpdating).toEqual([
      { uuid: "group-1" },
      { uuid: "group-3" },
    ]);
  });
});
