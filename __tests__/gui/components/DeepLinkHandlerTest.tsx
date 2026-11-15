import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import { DeepLinking } from "../../../source/logic/deeplinking";
import { SongRoute } from "../../../source/navigation";
import DeepLinkHandler from "../../../source/gui/components/DeepLinkHandler";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("DeepLinkHandler", () => {
  it("registers /open/songs/:uuid/:verse and navigates to SongRoute with uuid and selectedVerses", () => {
    mockNavigate.mockClear();
    let renderer: any;
    act(() => {
      renderer = TestRenderer.create(<DeepLinkHandler />);
    });

    DeepLinking.handle("hymnbook://open/songs/some-song-uuid-1234/3", false);

    expect(mockNavigate).toHaveBeenCalledWith(SongRoute, {
      uuid: "some-song-uuid-1234",
      selectedVerses: [{ index: 2 }],
    });

    act(() => {
      renderer.unmount();
    });
  });

  it("registers /open/songs/:uuid and navigates to SongRoute with uuid", () => {
    mockNavigate.mockClear();
    let renderer: any;
    act(() => {
      renderer = TestRenderer.create(<DeepLinkHandler />);
    });

    DeepLinking.handle("hymnbook://open/songs/some-song-uuid-1234", false);

    expect(mockNavigate).toHaveBeenCalledWith(SongRoute, {
      uuid: "some-song-uuid-1234",
    });

    act(() => {
      renderer.unmount();
    });
  });
});
