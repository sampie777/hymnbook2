import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import { Alert } from "react-native";

let capturedIAPOptions: any = null;
const mockFinishTransaction = jest.fn().mockResolvedValue(undefined as any);
const mockFetchProducts = jest.fn().mockResolvedValue([] as any);

jest.mock("react-native-iap", () => ({
  useIAP: (options: any) => {
    capturedIAPOptions = options;
    return {
      connected: true,
      products: [
        {
          id: "nl.sajansen.hymnbook2.tip100",
          title: "Tip",
          displayPrice: "€1.00",
        },
      ],
      fetchProducts: mockFetchProducts,
      requestPurchase: jest.fn(),
      finishTransaction: mockFinishTransaction,
    };
  },
  ErrorCode: {
    UserCancelled: "E_USER_CANCELLED",
  },
}));

import InAppPurchases from "../../../source/gui/components/donations/InAppPurchases";

describe("InAppPurchases", () => {
  it("deduplicates multiple purchase notifications for the same transaction", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    act(() => {
      TestRenderer.create(<InAppPurchases />);
    });

    expect(capturedIAPOptions).toBeDefined();

    // Trigger purchase success with transaction ID tx-test-1
    await act(async () => {
      await capturedIAPOptions.onPurchaseSuccess({
        id: "tx-test-1",
        productId: "nl.sajansen.hymnbook2.tip100",
      });
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(mockFinishTransaction).toHaveBeenCalledTimes(1);

    // Trigger duplicate purchase success (e.g. emitted after finishTransaction or duplicate listener)
    await act(async () => {
      await capturedIAPOptions.onPurchaseSuccess({
        id: "tx-test-1",
        productId: "nl.sajansen.hymnbook2.tip100",
      });
    });

    // Alert and finishTransaction must NOT have been called a second time
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(mockFinishTransaction).toHaveBeenCalledTimes(1);

    alertSpy.mockRestore();
  });
});
