import React from 'react';
import { StyleSheet } from 'react-native';
import IconLabel from "../IconLabel";
import UrlLink from "../UrlLink";
import { api } from "../../../logic/api";

interface Props {
}

const BuyMeACoffeePaymentButton: React.FC<Props> = ({}) => {
  const styles = createStyles();

  return <UrlLink url={api.donations.buyMeACoffee} style={styles.container}>
    <IconLabel text={"Buy me a coffee"}
               iconSource={require("./buymeacoffee-logo.jpeg")} />
  </UrlLink>
};

export default BuyMeACoffeePaymentButton;

const createStyles = () => StyleSheet.create({
  container: {
    marginBottom: 20,
    overflow: "hidden"
  },
});
