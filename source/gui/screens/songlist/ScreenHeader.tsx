import React from "react";
import { StyleSheet, View } from "react-native";
import DeleteModeButton from "./DeleteModeButton";

interface Props {
  toggleDeleteMode: () => void,
  isDeleteMode: boolean
}

const ScreenHeader: React.FC<Props> = ({ toggleDeleteMode, isDeleteMode = false }) => {
  return <View style={styles.container}>
    <DeleteModeButton onPress={toggleDeleteMode}
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
