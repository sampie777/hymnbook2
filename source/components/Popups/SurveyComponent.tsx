import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Survey } from "../../scripts/survey";
import ConfirmationModal from "../ConfirmationModal";
import { openLink } from "../../scripts/utils";
import { ThemeContextProps, useTheme } from "../ThemeProvider";

const SurveyComponent: React.FC<{
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
      <Text style={styles.contentText}>
        To improve your experience with this app, we would like to get some feedback from our users.
      </Text>
      <Text style={styles.contentText}>
        Are you willing to answer two simple questions?
      </Text>
    </View>
  </ConfirmationModal>;
};

export default SurveyComponent;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  popupContent: {},
  contentText: {
    paddingTop: 10,
    color: colors.text0
  }
});
