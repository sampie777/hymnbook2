import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Survey } from "../../../logic/survey";
import ConfirmationModal from "./ConfirmationModal";
import { openLink } from "../../../logic/utils/utils.ts";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider";
import SafeText from "../SafeText.tsx";

const SurveyModal: React.FC<{
  onCompleted?: () => void,
  onDenied?: () => void
}> = ({
        onCompleted,
        onDenied
      }) => {
  const styles = createStyles(useTheme());

  const openSurvey = () => {
    openLink(Survey.url())
      .then(Survey.complete)
      .catch(e => Alert.alert("Error opening link", e.message))
      .finally(onCompleted);
  };

  return <ConfirmationModal isOpen={true}
                            title={"Survey"}
                            closeText={"No, not now"}
                            confirmText={"Yes, I will"}
                            invertConfirmColor={true}
                            onClose={onDenied}
                            onConfirm={openSurvey}>
    <View style={styles.popupContent}>
      <SafeText style={styles.contentText}>
        To improve your experience with this app, we would like to get some feedback from our users.
      </SafeText>
      <SafeText style={styles.contentText}>
        Are you willing to help us decide what we should work on next?
      </SafeText>
    </View>
  </ConfirmationModal>;
};

export default SurveyModal;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  popupContent: {},
  contentText: {
    paddingTop: 10,
    color: colors.text.default
  }
});
