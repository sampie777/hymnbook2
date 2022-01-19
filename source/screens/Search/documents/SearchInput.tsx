import React from "react";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface ScreenProps {
  value: string;
  onChange?: (value: string) => void;
}

const SearchInput: React.FC<ScreenProps> = ({ value, onChange }) => {
  const styles = createStyles(useTheme());

  const clear = () => onChange?.("");

  return <View style={styles.container}>
    <TextInput placeholder={"Type to search..."}
               placeholderTextColor={styles.inputPlaceholder.color}
               style={styles.input}
               maxLength={255}
               returnKeyType={"search"}
               onChangeText={onChange}
               value={value} />
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
    paddingRight: 14,
    paddingLeft: 5,
    paddingVertical: 8,
    color: colors.textLighter
  },

  input: {
    flex: 1,
    backgroundColor: colors.surface1,
    color: colors.text,
    fontSize: 17,
    paddingLeft: 20,
    paddingRight: 3,
    paddingVertical: 8,
    borderRadius: 40
  },
  inputPlaceholder: {
    color: colors.textLighter
  }
});

