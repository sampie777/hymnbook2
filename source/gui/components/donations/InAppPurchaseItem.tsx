import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Product } from "react-native-iap";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider.tsx";

interface Props {
  product: Product;
  onPress?: () => void;
}

const InAppPurchaseItem: React.FC<Props> = ({ product, onPress }) => {
  const styles = createStyles(useTheme());

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.priceText}>{product.displayPrice}</Text>
      <Text style={styles.titleText}>{product.title}</Text>
    </TouchableOpacity>
  );
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderRadius: 20,
      borderColor: colors.border.lightVariant,
      height: 100,
      width: 100,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
    },
    priceText: {
      fontSize: 16,
      fontFamily: fontFamily.sansSerifLight,
      color: colors.text.default,
      marginTop: 5,
    },
    titleText: {
      fontSize: 12,
      fontFamily: fontFamily.sansSerifLight,
      color: colors.text.light,
    },
  });

export default InAppPurchaseItem;
