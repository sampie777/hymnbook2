import React from 'react';
import { StyleSheet } from 'react-native';
import IconLabel from "../IconLabel";
import UrlLink from "../UrlLink";
import { api } from "../../../logic/api";

interface Props {
}

const PayPalPaymentButton: React.FC<Props> = ({}) => {
  const styles = createStyles();

  return <UrlLink url={api.donations.paypal} style={styles.container}>
    <IconLabel text={"Donate using Paypal"}
               iconSource={require("./paypal-logo.png")} />
  </UrlLink>
};

export default PayPalPaymentButton;

const createStyles = () => StyleSheet.create({
  container: {
    marginBottom: 20,
    overflow: "hidden"
  },
});
