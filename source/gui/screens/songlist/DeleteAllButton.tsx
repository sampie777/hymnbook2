import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

interface Props {
  onPress: () => void;
}

const DeleteAllButton: React.FC<Props> = ({ onPress }) => {
  const styles = createStyles(useTheme());

  return <TouchableOpacity style={styles.container}
                           onPress={onPress}>
    <Text style={styles.text}>Delete all</Text>
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.delete,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 20,
    marginHorizontal: 10
  },
  text: {
    color: colors.delete,
    textAlign: "center",
    fontSize: 18
  }
});

export default DeleteAllButton;
