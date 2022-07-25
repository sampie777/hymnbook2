import React from "react";
import { Modal, StyleSheet, View, Text, Pressable } from "react-native";
import { ThemeContextProps, useTheme } from "../ThemeProvider";

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

const createStyles = ({ isDark, colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isDark ? "#0008" : "#0002"
  },

  modalView: {
    margin: 20,
    minWidth: 220,
    backgroundColor: colors.surface2,
    borderRadius: 8,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden"
  },

  modalTitle: {
    paddingHorizontal: 30,
    paddingTop: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.text
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
    color: colors.text
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  button: {
    flex: 1,
    elevation: 1
  },
  buttonText: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    textAlign: "center",
    backgroundColor: colors.surface2,
    color: colors.textLight
  },

  buttonDenyText: {
    borderBottomLeftRadius: 8,
  },
  buttonConfirmText: {
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
    color: colors.primary,
    borderBottomRightRadius: 8,
    fontWeight: "bold",
    fontFamily: fontFamily.sansSerifLight
  },
  buttonConfirmTextInvert: {
    backgroundColor: colors.primaryVariant,
    color: colors.onPrimary
  },

  soloButton: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  }
});
