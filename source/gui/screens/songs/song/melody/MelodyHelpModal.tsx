import React from "react";
import settings from "../../../../../settings";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import ConfirmationModal from "../../../../components/popups/ConfirmationModal";

interface Props {
  onClose?: () => void;
}

const MelodyHelpModal: React.FC<Props> = ({ onClose }) => {
  const styles = createStyles(useTheme());
  return <ConfirmationModal isOpen={true}
                            title={"Melody"}
                            closeText={"Got it!"}
                            invertConfirmColor={false}
                            onClose={onClose}
                            showCloseButton={true}>
    <View style={styles.popupContent}>
      <View style={styles.paragraph}>
        <Icon name={"music"} style={styles.icon} />
        <Text style={styles.contentText}>
          <Text style={styles.textBold}>{settings.longPressForMelodyMenu ? "Short" : "Long"} press </Text>
          to hide/show the melody.
        </Text>
      </View>

      <View style={styles.paragraph}>
        <Icon name={"music"} style={styles.icon} />
        <Text style={styles.contentText}>
          <Text style={styles.textBold}>{!settings.longPressForMelodyMenu ? "Short" : "Long"} press </Text>
          to show more melody settings.
        </Text>
      </View>

      <View style={styles.paragraph}>
        <Text style={styles.contentText}>
          By default, the melody is only shown for the first selected verse.
        </Text>
      </View>

      <View style={styles.paragraph}>
        <Text style={styles.contentText}>The melody feature is still in development. Feel free to share your feedback
          with us!
        </Text>
      </View>
    </View>
  </ConfirmationModal>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  popupContent: {
    alignSelf: "stretch",
    minWidth: "90%",
    marginRight: -10,
    marginBottom: -20
  },
  contentText: {
    color: colors.text,
    alignItems: "center",
    flex: 1
  },
  paragraph: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 7
  },
  icon: {
    fontSize: 20,
    color: colors.text,
    marginRight: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.surface1,
    borderColor: colors.background,
    borderWidth: 1,
    alignSelf: "flex-start"
  },
  textBold: {
    fontWeight: "bold"
  }
});

export default MelodyHelpModal;
