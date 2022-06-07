import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  onPress: () => void,
  onLongPress: () => void,
  isActivated: boolean
}

const DeleteModeButton: React.FC<Props> = ({ onPress, onLongPress, isActivated = false }) => {
  const styles = createStyles(useTheme());
  return <TouchableOpacity onPress={onPress}
                           onLongPress={onLongPress}
                           style={styles.deleteModeButton}>
    <Icon name={"trash-alt"}
          solid={isActivated}
          size={styles.deleteModeButton.fontSize}
          color={!isActivated ? styles.deleteModeButton.color : styles.deleteModeButtonActive.color} />
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  deleteModeButton: {
    padding: 15,
    right: 5,
    fontSize: 21,
    color: "#ffb8b8"
  },
  deleteModeButtonActive: {
    color: "#f17c7c"
  },
});

export default DeleteModeButton;
