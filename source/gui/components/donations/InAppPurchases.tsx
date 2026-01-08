import React, { useEffect } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { PurchaseIOS, useIAP, VerifyPurchaseResultIOS } from "react-native-iap";
import { isIOS, sanitizeErrorForRollbar } from "../../../logic/utils/utils.ts";
import InAppPurchaseItem from "./InAppPurchaseItem.tsx";
import { rollbar } from "../../../logic/rollbar.ts";
import { Donations } from "../../../logic/donations.ts";

interface Props {
}

const InAppPurchases: React.FC<Props> = ({}) => {
  if (!isIOS) return null;

  const { connected, products, fetchProducts, requestPurchase, verifyPurchase, } = useIAP({
    onPurchaseSuccess: (purchase) => {
      validatePurchase(purchase as PurchaseIOS);
    },
    onPurchaseError: (error) => {
      rollbar.error('Failed to complete in-app purchase', sanitizeErrorForRollbar(error));
    },
  });

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: Donations.inAppProductIds, type: 'in-app' });
    }
  }, [connected]);

  const validatePurchase = async (purchase: PurchaseIOS) => {
    try {
      const result = (await verifyPurchase({ apple: { sku: purchase.productId } })) as VerifyPurchaseResultIOS;

      if (!result.isValid) {
        rollbar.warning("In-app purchase receipt is invalid", { purchase, result });
        return;
      }

      Alert.alert("Thank you!", "Your donation is greatly appreciated\nand motivates me to keep on going with this work.");
    } catch (error) {
      rollbar.warning("Failed to validate in-app purchase", { ...sanitizeErrorForRollbar(error), purchase });
    }
  };

  return (
    <View style={styles.container}>
      {products.map(product =>
        <InAppPurchaseItem
          key={product.id}
          product={product}
          onPress={() => {
            rollbar.info("Requesting in-app purchase", { productId: product.id });
            requestPurchase({
              request: { apple: { sku: product.id } },
              type: 'in-app',
            })
          }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    gap: 20,
  },
});

export default InAppPurchases;
