import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import StripePaymentButton from './StripePaymentButton';
import PickerComponent from "../popups/PickerComponent";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Donations } from '../../../logic/donations';
import Checkbox from "../Checkbox";
import { useAppContext } from "../providers/AppContextProvider";

interface Props {
}

const DonationForm: React.FC<Props> = ({}) => {
  const initialCurrency = Donations.currencies.find(it => it.code == "ZAR") || Donations.currencies[0];

  const { developerMode } = useAppContext();
  const styles = createStyles(useTheme());
  const [amount, setAmount] = useState((initialCurrency.increment ?? 1) * 5);
  const [currency, setCurrency] = useState<Donations.Currency>(initialCurrency);
  const [showPicker, setShowPicker] = useState(false);
  const [shouldCapturePayment, setShouldCapturePayment] = useState(true);

  useEffect(() => {
    const minAmount = currency.increment ?? 1;
    if (amount >= minAmount) return;
    setAmount(minAmount);
  }, [currency]);

  const openPicker = () => setShowPicker(true);
  const closePicker = () => setShowPicker(false);

  const pickCurrency = (currency: Donations.Currency) => {
    setCurrency(currency);
    setShowPicker(false);
  }

  const decreaseAmount = () => {
    const increment = currency.increment ?? 1;
    setAmount(amount > 2 * increment ? amount - increment : increment)
  };
  const increaseAmount = () => setAmount(amount + (currency.increment ?? 1));

  const onAmountInputChange = (text: string) => {
    if (!text) {
      setAmount(0);
      return;
    }

    const value = parseInt(text);
    setAmount(value || currency.increment || 1);
  }

  return <View style={styles.container}>
    {!showPicker ? null :
      <PickerComponent selectedValue={currency}
                       values={Donations.currencies}
                       keyExtractor={item => item.code}
                       onDenied={closePicker}
                       onCompleted={pickCurrency}
                       rowContentRenderer={(item) =>
                         <Text
                           style={[styles.pickerRowText, (item.code == currency.code ? styles.pickerRowTextSelected : {})]}
                           importantForAccessibility={"auto"}>
                           {item.flag}{" ".repeat(3)}{item.code}
                         </Text>
                       } />
    }

    <View style={styles.row}>
      <Text style={styles.text}>Amount</Text>

      <View style={styles.amountContainer}>
        <TouchableOpacity style={styles.amountButton}
                          onPress={decreaseAmount}>
          <Icon name={"minus"}
                size={styles.amountButtonText.fontSize}
                color={styles.amountButtonText.color as string} />
        </TouchableOpacity>

        <TextInput
          style={[styles.text, styles.amountInput]}
          keyboardType="numeric"
          inputMode={"numeric"}
          value={amount <= 0 ? "" : amount.toString()}
          onChangeText={onAmountInputChange}
        />

        <TouchableOpacity style={styles.amountButton}
                          onPress={increaseAmount}>
          <Icon name={"plus"}
                size={styles.amountButtonText.fontSize}
                color={styles.amountButtonText.color as string} />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.row}>
      <Text style={styles.text}>Currency</Text>

      <TouchableOpacity onPress={openPicker} style={styles.currencyButton}>
        <Text style={[styles.text, styles.currencyText]}>{currency.flag}{" ".repeat(3)}{currency.code}</Text>
        <Icon name={"caret-down"} style={[styles.text, styles.arrow]} />
      </TouchableOpacity>
    </View>

    {!developerMode ? null :
      <View style={styles.row}>
        <Text style={styles.text}>Automatically process payment</Text>

        <Checkbox checked={shouldCapturePayment} onChange={setShouldCapturePayment} />
      </View>
    }

    <StripePaymentButton amount={amount}
                         currency={currency.code}
                         capturePayment={shouldCapturePayment} />
  </View>;
};

export default DonationForm;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
    paddingHorizontal: 40,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 20
  },
  text: {
    color: colors.text.default,
    fontSize: 16,
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-end",
    flex: 1,
    gap: 10,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: colors.surface2,
    padding: 8,
    width: 60,
    textAlign: "center",
    flex: 1,
    fontSize: 18,
  },
  amountButton: {
    minWidth: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  amountButtonText: {
    fontSize: 18,
    color: colors.primary.default
  },

  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    right: -5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 1,
  },
  currencyText: {
    color: colors.text.default,
    fontSize: 18,
    textAlign: "right"
  },
  arrow: {
    fontSize: 16,
    marginLeft: 7,
    color: colors.text.default
  },


  pickerRowText: {
    color: colors.text.default,
    fontSize: 15
  },
  pickerRowTextSelected: {
    fontWeight: "bold",
  },
});
