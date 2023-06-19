import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { isIOS } from "../../../logic/utils";

interface Props {
  onPress: () => void,
  onLongPress: () => void,
  isActivated: boolean
}

const DeleteModeButton: React.FC<Props> = ({ onPress, onLongPress, isActivated = false }) => {
  const styles = createStyles();
  return <TouchableOpacity onPress={onPress}
                           onLongPress={onLongPress}
                           style={styles.deleteModeButton}
                           hitSlop={{ top: 10, right: 10, bottom: isIOS ? 5 : 10, left: 10 }}>
    <Icon name={"trash-alt"}
          solid={isActivated}
          size={styles.deleteModeButton.fontSize}
          color={!isActivated ? styles.deleteModeButton.color : styles.deleteModeButtonActive.color} />
  </TouchableOpacity>;
};

const createStyles = () => StyleSheet.create({
  deleteModeButton: {
    paddingHorizontal: 15,
    right: 5,
    fontSize: 21,
    color: "#ffb8b8",
    paddingVertical: 10
  },
  deleteModeButtonActive: {
    color: "#f17c7c"
  }
});

export default DeleteModeButton;
