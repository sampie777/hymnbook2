import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import { Alert } from "react-native";

let capturedIAPOptions: any = null;
const mockFinishTransaction = jest.fn<() => Promise<any>>().mockResolvedValue(undefined);
const mockFetchProducts = jest.fn<() => Promise<any>>().mockResolvedValue([]);
const mockVerifyPurchase = jest.fn<() => Promise<any>>().mockResolvedValue({ isValid: true });

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
      verifyPurchase: mockVerifyPurchase,
      finishTransaction: mockFinishTransaction,
    };
  },
  ErrorCode: {
    UserCancelled: "E_USER_CANCELLED",
  },
}));

jest.mock("../../../source/logic/utils/utils.ts", () => {
  const actual = jest.requireActual("../../../source/logic/utils/utils.ts") as any;
  return {
    ...actual,
    isIOS: true,
    sanitizeErrorForRollbar: (err: any) => err,
  };
});

import InAppPurchases from "../../../source/gui/components/donations/InAppPurchases";

describe("InAppPurchases", () => {
  it("deduplicates multiple purchase notifications for the same transaction", async () => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    act(() => {
      TestRenderer.create(<InAppPurchases />);
    });

    expect(capturedIAPOptions).not.toBeNull();

    const purchase = {
      productId: "nl.sajansen.hymnbook2.tip100",
      transactionId: "trans_12345",
    };

    // First arrival of purchase success
    await act(async () => {
      await capturedIAPOptions.onPurchaseSuccess(purchase);
    });

    expect(mockFinishTransaction).toHaveBeenCalledTimes(1);

    // Duplicate arrival of same purchase
    await act(async () => {
      await capturedIAPOptions.onPurchaseSuccess(purchase);
    });

    // Should finish transaction again if StoreKit retries, but not double alert
    expect(mockFinishTransaction).toHaveBeenCalledTimes(2);
  });
});
