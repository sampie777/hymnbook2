import React from "react";
import { Modal, StyleSheet, View, Text, Pressable, TouchableOpacity, ScrollView } from "react-native";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";
import { RectangularInset } from "../utils";

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
  children?: React.ReactNode;
}

const ConfirmationModal: React.FC<ComponentProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       onDeny,
                                                       invertConfirmColor = false,
                                                       closeText = "Close",
                                                       confirmText = "Confirm",
                                                       title,
                                                       message,
                                                       showCloseButton = false,
                                                       children
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
                                onPress={onClose}
                                hitSlop={RectangularInset(10)}
                                accessibilityLabel={"Close popup"}>
                <Icon name={"times"} style={styles.headerCloseButtonText} />
              </TouchableOpacity>
            }
          </View>
          <ScrollView style={styles.modalMessageContainer} contentContainerStyle={styles.modalMessage}>
            {children ? children :
              <Text style={styles.modalMessageText}>{message}</Text>}
          </ScrollView>

          <View style={styles.buttons}>
            {onDeny === undefined ? undefined :
              <Pressable style={[styles.button, (onConfirm !== undefined ? {} : styles.soloButton)]}
                         onPress={onDeny}>
                <Text style={[styles.buttonText, styles.buttonDenyText]}
                      importantForAccessibility={"auto"}>
                  {closeText}
                </Text>
              </Pressable>
            }
            {onConfirm === undefined ? undefined :
              <Pressable style={styles.button}
                         onPress={onConfirm}>
                <Text
                  style={[styles.buttonText,
                    styles.buttonConfirmText,
                    (invertConfirmColor ? styles.buttonConfirmTextInvert : {}),
                    (onClose !== undefined ? {} : styles.soloButton)]}
                  importantForAccessibility={"auto"}>
                  {confirmText}
                </Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "100%"
  },

  headerCloseButton: {
    width: 45,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center"
  },
  headerCloseButtonText: {
    color: colors.text.lighter,
    fontSize: 15
  },

  modalTitle: {
    minWidth: "70%",    // Setting the width and flex like this will prevent words from disappearing
    flexBasis: "70%",
    flexShrink: 1,

    paddingHorizontal: 30,
    paddingVertical: 12,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.text.default
  },

  modalMessageContainer: {
    flexGrow: 0
  },
  modalMessage: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  modalMessageText: {
    color: colors.text.default
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    borderTopWidth: 1,
    borderTopColor: colors.border.light
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
    color: colors.text.light
  },

  buttonDenyText: {
    borderBottomLeftRadius: 8
  },
  buttonConfirmText: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border.light,
    color: colors.primary.default,
    borderBottomRightRadius: 8,
    fontWeight: "bold",
    fontFamily: fontFamily.sansSerifLight
  },
  buttonConfirmTextInvert: {
    backgroundColor: colors.primary.variant,
    color: colors.onPrimary
  },

  soloButton: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
    borderRightWidth: 0
  }
});
