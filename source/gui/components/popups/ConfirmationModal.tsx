import React from "react";
import { Modal, StyleSheet, View, Text, Pressable, TouchableOpacity } from "react-native";
import { ThemeContextProps, useTheme } from "../ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";

interface ComponentProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  onDeny?: () => void;
  invertConfirmColor?: boolean;
  closeText?: string;
  confirmText?: string;
  title?: string;
  message?: string;
  showCloseButton?: boolean;
}

const ConfirmationModal: React.FC<ComponentProps> = ({
                                                       children,
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       onDeny,
                                                       invertConfirmColor = false,
                                                       closeText = "Close",
                                                       confirmText = "Confirm",
                                                       title,
                                                       message,
                                                       showCloseButton = false
                                                     }) => {
  const styles = createStyles(useTheme());
  if (onDeny === undefined) {
    onDeny = onClose;
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            {!showCloseButton ? undefined : <View style={styles.headerCloseButton} />}

            <Text style={styles.modalTitle}>{title}</Text>

            {!showCloseButton ? undefined :
              <TouchableOpacity style={styles.headerCloseButton}
                                onPress={onClose}>
                <Icon name={"times"} style={styles.headerCloseButtonText} />
              </TouchableOpacity>
            }
          </View>
          <View style={styles.modalMessage}>
            {children ? children :
              <Text style={styles.modalMessageText}>{message}</Text>}
          </View>

          <View style={styles.buttons}>
            {onDeny === undefined ? undefined :
              <Pressable style={[styles.button, (onConfirm !== undefined ? {} : styles.soloButton)]}
                         onPress={onDeny}>
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

  modalHeader: {
    flexDirection: "row",
    paddingTop: 10
  },

  headerCloseButton: {
    width: 45,
    justifyContent: "center",
    alignItems: "center"
  },
  headerCloseButtonText: {
    color: colors.textLighter,
    fontSize: 15
  },

  modalTitle: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 10,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.text
  },
  modalMessage: {
    paddingHorizontal: 30,
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
    borderTopColor: colors.borderLight
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
    borderBottomLeftRadius: 8
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
    borderRightWidth: 0
  }
});
