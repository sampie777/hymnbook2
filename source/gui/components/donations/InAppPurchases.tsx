import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { PurchaseIOS, useIAP, VerifyPurchaseResultIOS } from "react-native-iap";
import { isIOS } from "../../../logic/utils/utils.ts";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider.tsx";
import InAppPurchaseItem from "./InAppPurchaseItem.tsx";

interface Props {
}

const productIds = ['nl.sajansen.hymnbook2.donation100'];

const InAppPurchases: React.FC<Props> = ({}) => {
  if (!isIOS) return null;

  const styles = createStyles(useTheme())

  const { connected, products, fetchProducts, requestPurchase, verifyPurchase, } = useIAP({
    onPurchaseSuccess: (purchase) => {
      console.log('Purchase successful:', purchase);
      // Handle successful purchase
      validatePurchase(purchase as PurchaseIOS);
    },
    onPurchaseError: (error) => {
      console.error('Purchase failed:', error);
      // Handle purchase error
    },
  });

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: productIds, type: 'in-app' });
    }
  }, [connected]);

  const validatePurchase = async (purchase: PurchaseIOS) => {
    try {
      const result = (await verifyPurchase({
        apple: { sku: purchase.productId },
      })) as VerifyPurchaseResultIOS;

      if (result.isValid) {
        // Grant user the purchased content
        console.log('Receipt is valid');
      } else {
        // This should never be reached as Apple already validates the receipt and will throw an error if invalid
        console.error('Receipt is invalid');
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {products.map(product => (
          <InAppPurchaseItem
            key={product.id}
            product={product}
            onPress={() => requestPurchase({
              request: { apple: { sku: product.id } },
              type: 'in-app',
            })} />
        )
      )}
    </View>
  );
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
    },
  });

export default InAppPurchases;
