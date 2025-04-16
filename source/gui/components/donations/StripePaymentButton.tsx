import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useAppContext } from "../providers/AppContextProvider";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider";
import LoadingIndicator from "../LoadingIndicator";
import { rollbar } from "../../../logic/rollbar";
import { isConnectionError } from '../../../logic/apiUtils';
import { Donations } from "../../../logic/donations";
import { ValidationError } from "../../../logic/utils";
import { useIsMounted } from "../utils";
import config from "../../../config";

interface Props {
  amount?: number
  currency?: string
  capturePayment?: boolean
}

const StripePaymentButton: React.FC<Props> = ({ amount = 100, currency = "ZAR", capturePayment = true }) => {
  const isMounted = useIsMounted();
  const appContext = useAppContext();
  const styles = createStyles(useTheme());
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const initiateTransaction = async () => {
    const finalAmount = amount;
    const finalCurrency = currency;

    try {
      Donations.validateDonation(finalAmount, finalCurrency)
    } catch (error) {
      if (error instanceof ValidationError) {
        return Alert.alert("Whoops", error.message)
      }
      return rollbar.error("Failed to validate donation", {
        error: error,
        amount: finalAmount,
        currency: finalCurrency,
      })
    }

    setLoading(true);

    try {
      await Donations.initializePaymentSheet(initPaymentSheet, finalAmount, finalCurrency, appContext.developerMode, capturePayment);
      if (!isMounted()) return;

      const { error } = await presentPaymentSheet();

      if (!error) {
        return Alert.alert('Success', 'Thank you for supporting the app!');
      }
      if (error.code == "Canceled") return;

      rollbar.error("Could not process payment sheet", {
        error: error,
        amount: finalAmount,
        currency: finalCurrency,
      });
      throw Error("Something went wrong during finalizing the donation.")
    } catch (error) {
      if (isConnectionError(error)) {
        return Alert.alert("Connection error", "Please check your connection with the internet.\n\nOtherwise our server possible went for a short vacation.")
      }

      rollbar.error("Failed to process donation", {
        error: error,
        amount: finalAmount,
        currency: finalCurrency,
      })
      Alert.alert("Failed to process donation", `${error}\n\nSorry about that...`)
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  };

  return <StripeProvider
    publishableKey={appContext.developerMode ? config.stripe.publicKey.test : config.stripe.publicKey.live}
    merchantIdentifier="merchant.nl.sajansen.hymnbook2" // required for Apple Pay
    // urlScheme="hymnbook" // required for 3D Secure and bank redirects
  >
    <TouchableOpacity
      style={[styles.button, (loading || amount <= 0) ? styles.buttonLoading : {}]}
      disabled={loading}
      onPress={initiateTransaction}
    >
      {loading ? <LoadingIndicator size={18} opacity={1} /> :
        <Text style={styles.buttonText}>
          <Text style={{ fontWeight: "bold" }}>Support</Text> with {currency} {amount},-
        </Text>
      }
    </TouchableOpacity>
  </StripeProvider>
};

export default StripePaymentButton;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  button: {
    marginTop: 10,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.primary.variant,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonLoading: {
    opacity: 0.8,
  },

  buttonText: {
    fontSize: 16,
    color: colors.onPrimary,
    textAlign: "center"
  }
});

