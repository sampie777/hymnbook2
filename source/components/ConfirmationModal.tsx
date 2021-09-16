import React from "react";
import { Alert, Modal, Pressable, StyleSheet, View, Text } from "react-native";

interface ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ComponentProps> = ({ children, isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalText}>{children}</View>

          <View style={styles.buttons}>
            <Pressable style={[styles.button, styles.buttonOpen]}
                       onPress={onConfirm}>
              <Text style={styles.textStyle}>Confirm</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.buttonClose]}
                       onPress={onClose}>
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000022"
  },

  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  modalText: {
    marginBottom: 40,
    padding: 10,
    textAlign: "center",
    alignItems: "center",
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    elevation: 1,
    marginHorizontal: 10,
  },
  buttonOpen: {
    backgroundColor: "#2196F3"
  },
  buttonClose: {
    backgroundColor: "#b8c2c9",
  },

  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  }
});
