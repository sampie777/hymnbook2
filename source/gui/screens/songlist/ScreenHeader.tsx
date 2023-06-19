import React from "react";
import { StyleSheet, View } from "react-native";
import DeleteModeButton from "./DeleteModeButton";

interface Props {
  toggleDeleteMode: () => void,
  clearAll: () => void,
  isDeleteMode: boolean
}

const ScreenHeader: React.FC<Props> = ({ toggleDeleteMode, clearAll, isDeleteMode = false }) => {
  return <View style={styles.container}>
    <DeleteModeButton onPress={toggleDeleteMode}
                      onLongPress={clearAll}
                      isActivated={isDeleteMode} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export default ScreenHeader;
