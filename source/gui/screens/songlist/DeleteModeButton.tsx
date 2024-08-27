import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { isIOS } from "../../../logic/utils";

interface Props {
  onPress: () => void,
  onLongPress?: () => void,
  isActivated: boolean,
  listHasBeenChanged: boolean,
}

const DeleteModeButton: React.FC<Props> = ({ onPress, onLongPress, isActivated = false, listHasBeenChanged }) => {
  const styles = createStyles(useTheme());
  return <TouchableOpacity onPress={onPress}
                           onLongPress={onLongPress}
                           style={styles.deleteModeButton}
                           hitSlop={{ top: 10, right: 10, bottom: isIOS ? 5 : 10, left: 10 }}>
    {isActivated
      ? <Text style={styles.text}
              importantForAccessibility={"auto"}
              accessibilityLabel={listHasBeenChanged ? "Done" : "Cancel delete mode"}>
        {listHasBeenChanged ? "Done" : "Cancel"}
      </Text>
      : <Icon name={"trash-alt"}
              solid={isActivated}
              accessibilityLabel={"Enable delete mode"}
              size={styles.deleteModeButton.fontSize}
              color={!isActivated ? styles.deleteModeButton.color : styles.deleteModeButtonActive.color} />
    }
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  deleteModeButton: {
    paddingHorizontal: 15,
    right: 5,
    fontSize: 21,
    color: "#ffb8b8",
    paddingVertical: 10
  },
  deleteModeButtonActive: {
    color: colors.delete
  },
  text: {
    color: colors.text.default,
    fontSize: 16
  }
});

export default DeleteModeButton;
