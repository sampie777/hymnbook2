import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";

export enum Types {
  Songs = "Songs",
  Documents = "Documents"
}

interface ComponentProps {
  selectedType: Types;
  onTypeClick?: (type: Types) => void;
  isProcessing: boolean;
}

const TypeSelectBar: React.FC<ComponentProps> = ({ selectedType, onTypeClick, isProcessing }) => {
  const styles = createStyles(useTheme());
  return (<View style={styles.container}>
    <TouchableOpacity style={[styles.typeContainer, (Types.Songs !== selectedType ? {} : styles.selectedContainer)]}
                      onPress={() => onTypeClick?.(Types.Songs)}
                      disabled={isProcessing}>
      <Icon name={"music"}
            style={[
              styles.icon,
              { left: -1 },
              (Types.Songs !== selectedType ? {} : styles.selectedIcon)
            ]} />
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.typeContainer, (Types.Documents !== selectedType ? {} : styles.selectedContainer)]}
      onPress={() => onTypeClick?.(Types.Documents)}
      disabled={isProcessing}>
      <Icon name={"file-alt"}
            style={[
              styles.icon,
              (Types.Documents !== selectedType ? {} : styles.selectedIcon)
            ]} />
    </TouchableOpacity>
  </View>);
};

export default TypeSelectBar;


const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
    flexWrap: "wrap",
    justifyContent: "space-evenly"
  },

  typeContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 15,
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: colors.button.default
  },
  selectedContainer: {
    borderColor: isDark ? colors.border.default : colors.primary.default
  },

  icon: {
    color: colors.text.light,
    fontSize: 24
  },
  selectedIcon: {
    color: colors.primary.default
  },

  type: {
    color: colors.text.default
  },
  selectedType: {
    backgroundColor: colors.button.variant,
    borderColor: colors.border.variant
  }
});
