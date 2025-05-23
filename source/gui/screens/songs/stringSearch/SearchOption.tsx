import React from "react";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  title: string;
  active?: boolean;

  onPress?(): void;
}

const SearchOption: React.FC<Props> = ({ title, active, onPress }) => {
  const styles = createStyles(useTheme());

  return <TouchableOpacity style={[styles.container, (active ? styles.containerActive : {})]}
                           onPress={onPress}
                           hitSlop={{ top: 13, bottom: 13, }}>
    <Text style={[styles.title, (active ? styles.titleActive : {})]}
          importantForAccessibility={"auto"}>
      {title}
    </Text>
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface1,
    borderRadius: 50,
    marginHorizontal: 5,
    paddingHorizontal: 22,
    paddingVertical: 7,
  },
  containerActive: {
    backgroundColor: colors.primary.variant
  },
  title: {
    color: colors.text.default,
  },
  titleActive: {
    color: colors.onPrimary
  }
});

export default SearchOption;
