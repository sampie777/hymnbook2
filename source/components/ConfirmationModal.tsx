import React from "react";
import { Modal, StyleSheet, View, Text, Pressable } from "react-native";
import { ThemeContextProps, useTheme } from "./ThemeProvider";

interface ComponentProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  invertConfirmColor?: boolean;
  closeText?: string;
  confirmText?: string;
  title?: string;
  message?: string;
}

const ConfirmationModal: React.FC<ComponentProps> = ({
                                                       children,
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       invertConfirmColor = false,
                                                       closeText = "Close",
                                                       confirmText = "Confirm",
                                                       title,
                                                       message
                                                     }) => {
  const styles = createStyles(useTheme());
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
          <View style={styles.modalMessage}>
            {children ? children :
              <Text style={styles.modalMessageText}>{message}</Text>}
          </View>

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

const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isDark ? "#0008" : "#0002"
  },

  modalView: {
    margin: 20,
    minWidth: 220,
    backgroundColor: colors.height2,
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
    textAlign: "center",
    color: colors.text0
  },
  modalMessage: {
    paddingHorizontal: 30,
    paddingTop: 15,
    paddingBottom: 50,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  modalMessageText: {
    color: colors.text0
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    borderTopWidth: 1,
    borderTopColor: colors.border1,
  },
  button: {
    flex: 1,
    elevation: 1
  },
  buttonText: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    textAlign: "center",
    backgroundColor: colors.height2,
    color: colors.text0
  },

  buttonDenyText: {
    borderBottomLeftRadius: 8,
    color: "#eee",
  },
  buttonConfirmText: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border1,
    color: colors.tint,
    borderBottomRightRadius: 8,
    fontWeight: "bold",
    fontFamily: "sans-serif-light"
  },
  buttonConfirmTextInvert: {
    backgroundColor: colors.tint1,
    color: "#fff"
  },

  soloButton: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  }
});
