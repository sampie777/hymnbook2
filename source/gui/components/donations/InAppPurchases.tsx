import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { ErrorCode, PurchaseIOS, useIAP } from "react-native-iap";
import { isIOS, sanitizeErrorForRollbar } from "../../../logic/utils/utils.ts";
import InAppPurchaseItem from "./InAppPurchaseItem.tsx";
import { rollbar } from "../../../logic/rollbar.ts";
import { Donations } from "../../../logic/donations.ts";

interface Props {
}

const processedTransactionIds = new Set<string>();

const InAppPurchases: React.FC<Props> = ({}) => {
  if (!isIOS) return null;

  const [processing, setProcessing] = useState(false);

  const { connected, products, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      await validateAndFinishPurchase(purchase as PurchaseIOS);
    },
    onPurchaseError: (error) => {
      setProcessing(false);
      if (error.code !== ErrorCode.UserCancelled) {
        rollbar.error('Failed to complete in-app purchase', sanitizeErrorForRollbar(error));
      }
    },
  });

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: Donations.inAppProductIds, type: 'in-app' })
        .catch(error => {
          rollbar.warning("Failed to fetch in-app products", sanitizeErrorForRollbar(error));
        });
    }
  }, [connected]);

  const validateAndFinishPurchase = async (purchase: PurchaseIOS) => {
    const transactionId = purchase?.id || purchase?.transactionId;
    if (!transactionId || !purchase?.productId) {
      rollbar.warning("In-app purchase receipt is invalid", { purchase });
      setProcessing(false);
      return;
    }

    try {
      if (!processedTransactionIds.has(transactionId)) {
        processedTransactionIds.add(transactionId);
        rollbar.info("Donation received", {
          type: "in-app",
          product: purchase.productId,
        });
        Alert.alert("Thank you!", "Your donation is greatly appreciated\nand motivates me to keep on going with this work.");
      }
    } catch (error) {
      rollbar.warning("Failed to validate in-app purchase", { ...sanitizeErrorForRollbar(error), purchase });
    } finally {
      try {
        await finishTransaction({ purchase, isConsumable: true });
      } catch (finishError) {
        rollbar.error("Failed to finish in-app transaction", { ...sanitizeErrorForRollbar(finishError), purchase });
      }
      setProcessing(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    if (processing) return;
    setProcessing(true);
    rollbar.info("Requesting in-app purchase", { productId });

    try {
      await requestPurchase({
        request: { apple: { sku: productId } },
        type: 'in-app',
      });
    } catch (error) {
      setProcessing(false);
      rollbar.warning("In-app purchase request failed", sanitizeErrorForRollbar(error));
    }
  };

  return (
    <View style={styles.container}>
      {products.map((product) =>
        <InAppPurchaseItem
          key={product.id}
          product={product}
          disabled={processing}
          onPress={() => handlePurchase(product.id)}
        />
      )}
      {processing && <ActivityIndicator style={styles.loader} size="small" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loader: {
    marginVertical: 10,
  },
});

export default InAppPurchases;
