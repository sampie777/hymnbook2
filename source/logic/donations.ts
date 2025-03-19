import { PaymentSheet } from "@stripe/stripe-react-native";
import { Security } from "./security";
import { ButtonType } from "@stripe/stripe-react-native/src/types/PlatformPay";
import { api } from "./api";
import { responseStatusToText } from "./apiUtils";
import { rollbar } from "./rollbar";
import { validate } from "./utils";
import type { InitPaymentSheetResult } from "@stripe/stripe-react-native/src/types";

export namespace Donations {

  export type Currency = {
    code: string;
    flag: string;
    increment?: number;
  }

  export const currencies: Currency[] = [
    { code: "ZAR", flag: "🇿🇦", increment: 20 },
    { code: "EUR", flag: "🇪🇺" },
    { code: "AUD", flag: "🇦🇺" },
    { code: "CAD", flag: "🇨🇦" },
    // { code: "CHF", flag: "🇨🇭" },
    // { code: "CNY", flag: "🇨🇳" },
    { code: "GBP", flag: "🇬🇧" },
    // { code: "JPY", flag: "🇯🇵" },
    // { code: "SEK", flag: "🇸🇪" },
    { code: "NZD", flag: "🇳🇿" },
    { code: "USD", flag: "🇺🇸" },
  ]
    .sort((a, b) => a.code.localeCompare(b.code));

  export const validateDonation = (amount: number, currency: string) => {
    validate(amount > 0, "You can't donate zero money ;)");
    const currencyObject = currencies.find(it => it.code == currency);
    validate(currencyObject != undefined, "You should choose a valid currency!");
    validate(amount >= (currencyObject?.increment ?? 1), "Unfortunately, that amount is not large enough for the banking company to accept...");
  }

  export const initializePaymentSheet = async (
    initPaymentSheet: (params: PaymentSheet.SetupParams) => Promise<InitPaymentSheetResult>,
    amount: number,
    currency: string,
    isTest: boolean = false) => {
    const { paymentIntent, ephemeralKey, customer, } = await fetchPaymentSheetParams(amount, currency);

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Hymnbook",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      allowsDelayedPaymentMethods: true,
      billingDetailsCollectionConfiguration: {
        phone: PaymentSheet.CollectionMode.NEVER,
        address: PaymentSheet.AddressCollectionMode.NEVER,
      },
      defaultBillingDetails: {
        name: Security.getDeviceId(),
      },
      googlePay: {
        merchantCountryCode: 'NL',
        testEnv: isTest,
        buttonType: ButtonType.Donate,
        label: "Support with"
      },
      applePay: {
        merchantCountryCode: "NL",
        buttonType: ButtonType.Donate
      },
      primaryButtonLabel: `Support with ${currency} ${amount.toFixed(2)}`
    });

    if (!error) return;

    rollbar.error("Could not initialize payment sheet", {
      error: error,
      amount: amount,
      currency: currency,
      isTest: isTest,
    })
    throw Error("Something went wrong setting up the donation.");
  };

  export const fetchPaymentSheetParams = async (amount: number, currency: string) => {
    const response = await api.donations.stripe.paymentSheet(amount, currency);
    const data = await response.json();

    if (response.ok) {
      return data as { paymentIntent: string, ephemeralKey?: string, customer?: string };
    }

    const serverResponseAsText = `(${response.status} ${responseStatusToText(response)})`;
    rollbar.error("Failed to obtain valid response from server for payment sheet", {
      json: data,
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      response: response,
      content: data,
      serverResponseAsText: serverResponseAsText
    })

    throw Error(`Something went wrong setting up the donation. Please try again later.`)
  };
}