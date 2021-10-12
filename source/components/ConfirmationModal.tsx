import React from "react";
import { Modal, StyleSheet, View, Text, Pressable } from "react-native";

interface ComponentProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  invertConfirmColor?: boolean;
  closeText?: string;
  confirmText?: string;
  title?: string;
}

const ConfirmationModal: React.FC<ComponentProps> = ({
                                                       children,
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       invertConfirmColor = false,
                                                       closeText = "Close",
                                                       confirmText = "Confirm",
                                                       title
                                                     }) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalText}>{children}</View>

          <View style={styles.buttons}>
            {onClose === undefined ? undefined :
              <Pressable style={[styles.button, (onConfirm !== undefined ? {} : styles.soloButton)]}
                         onPress={onClose}>
                <Text style={[styles.buttonText, styles.buttonDenyText]}>{closeText}</Text>
              </Pressable>
            }
            {onConfirm === undefined ? undefined :
              <Pressable style={styles.button}
                         onPress={onConfirm}>
                <Text
                  style={[styles.buttonText,
                    styles.buttonConfirmText,
                    (invertConfirmColor ? styles.buttonConfirmTextInvert : {}),
                    (onClose !== undefined ? {} : styles.soloButton)]}>{confirmText}</Text>
              </Pressable>
            }
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
    minWidth: 220,
    backgroundColor: "white",
    borderRadius: 8,
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

  modalTitle: {
    paddingHorizontal: 30,
    paddingTop: 25,
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    paddingHorizontal: 30,
    paddingTop: 15,
    paddingBottom: 50,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center"
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    borderTopWidth: 1,
    borderTopColor: "#eee"
  },
  button: {
    flex: 1,
    elevation: 1
  },
  buttonText: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    textAlign: "center"
  },

  buttonDenyText: {
    borderBottomLeftRadius: 8,
    backgroundColor: "#fff",
    color: "#8f979a"
  },
  buttonConfirmText: {
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
    color: "#2196F3",
    borderBottomRightRadius: 8,
    fontWeight: "bold",
    fontFamily: "sans-serif-light"
  },
  buttonConfirmTextInvert: {
    backgroundColor: "#2196F3",
    color: "#fff"
  },

  soloButton: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  }
});
