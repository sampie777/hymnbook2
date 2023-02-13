import React from "react";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface ScreenProps {
  value: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
}

const SearchInput: React.FC<ScreenProps> = ({ value, onChange, autoFocus = false }) => {
  const styles = createStyles(useTheme());

  const clear = () => onChange?.("");

  return <View style={styles.container}>
    <TextInput placeholder={"Type to search..."}
               placeholderTextColor={styles.inputPlaceholder.color}
               style={styles.input}
               maxLength={255}
               returnKeyType={"search"}
               onChangeText={onChange}
               value={value}
               autoFocus={autoFocus} />
    {value.length === 0
      ? <Icon name={"search"} style={styles.icon} />
      : <TouchableOpacity onPress={clear}>
        <Icon name={"times"} style={styles.icon} />
      </TouchableOpacity>
    }
  </View>;
};

export default SearchInput;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 40,
    marginBottom: 15,
    marginHorizontal: 8
  },

  icon: {
    fontSize: 18,
    width: 45,
    textAlign: "center",
    paddingVertical: 12,
    color: colors.textLighter
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    paddingLeft: 20,
    paddingRight: 3,
    paddingVertical: 2,
    alignSelf: "stretch"
  },
  inputPlaceholder: {
    color: colors.textLighter
  }
});

