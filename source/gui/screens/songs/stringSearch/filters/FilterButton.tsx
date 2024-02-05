import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";

interface Props {
  onPress: () => void;
  isOpen: boolean;
}

const FilterButton: React.FC<Props> = ({ onPress, isOpen }) => {
  const styles = createStyles(useTheme());

  return <TouchableOpacity style={styles.container}
                           onPress={onPress}
                           hitSlop={{ top: 10, right: 30, bottom: 10, left: 5 }}>
    <Icon name={"filter"} style={styles.icon} />
    <Icon name={isOpen ? "sort-up" : "sort-down"} style={styles.icon} />
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    marginHorizontal: 5,
    display: "flex",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 5,
  },

  icon: {
    fontSize: 14,
    textAlign: "center",
    color: colors.text.lighter
  }
});

export default FilterButton;
