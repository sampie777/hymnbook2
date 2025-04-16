import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemeContextProps, useTheme } from "./providers/ThemeProvider";

type Props = {
  checked?: boolean,
  onChange?: (checked: boolean) => void
};

const Checkbox: React.FC<Props> = ({ checked, onChange }) => {
  const styles = createStyles(useTheme());

  return <TouchableOpacity onPress={() => onChange?.(!checked)} style={styles.button}>
    {checked && <View style={styles.checked} />}
  </TouchableOpacity>
};

export default Checkbox;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.text.light,
    padding: 2,
    width: 20,
    height: 20,
    borderRadius: 3,
  },
  checked: {
    backgroundColor: colors.text.light,
    flex: 1,
    borderRadius: 2
  },
});
