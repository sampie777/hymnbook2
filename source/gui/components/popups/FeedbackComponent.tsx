import React from "react";
import config from "../../../config";
import { Survey } from "../../../logic/survey";
import { openLink } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConfirmationModal from "./ConfirmationModal";

const SurveyComponent: React.FC<{ onCompleted?: () => void }> = ({ onCompleted }) => {
  const styles = createStyles(useTheme());

  const openSurvey = () => {
    openLink(Survey.url())
      .then(Survey.complete)
      .catch(e => Alert.alert("Error opening link", e.message))
      .finally(onCompleted);
  };

  return <TouchableOpacity style={styles.surveyButton}
                           onPress={openSurvey}>
    <Text style={styles.surveyText}>
      Complete the questionnaire
    </Text>
  </TouchableOpacity>;
};

const FeedbackComponent: React.FC<{
  onCompleted?: () => void,
  onDenied?: () => void
}> = ({
        onCompleted,
        onDenied
      }) => {
  const styles = createStyles(useTheme());

  const openFeedbackForm = () => {
    openLink(config.feedbackUrl)
      .catch(e => Alert.alert("Error opening link", e.message))
      .finally(onDenied);
  };

  const joinWhatsappGroup = () => {
    openLink(config.whatsappFeedbackGroupUrl)
      .catch(e => Alert.alert("Error opening link", e.message))
      .finally(onCompleted);
  };

  return <ConfirmationModal isOpen={true}
                            title={"Feedback"}
                            closeText={"Feedback form"}
                            confirmText={"Join on Whatsapp"}
                            invertConfirmColor={false}
                            onClose={onDenied}
                            onDeny={openFeedbackForm}
                            onConfirm={joinWhatsappGroup}
                            showCloseButton={true}>
    <View style={styles.popupContent}>
      <Text style={styles.contentText}>
        We value your feedback.
      </Text>
      <Text style={styles.contentText}>
        Please feel free to join our Whatsapp feedback group, so you can help us make the right
        design choices. This way you can also leave instant feedback about problems you encounter or new ideas you want
        to share. We would appreciate this a lot.
      </Text>
      <Text style={styles.contentText}>
        If you don't want to get involved, you can just fill out the feedback form (anonymously).
      </Text>

      {!Survey.mayBeShown() ? null : <SurveyComponent onCompleted={onCompleted} />}
    </View>
  </ConfirmationModal>;
};

export default FeedbackComponent;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  popupContent: {},
  contentText: {
    paddingTop: 10,
    color: colors.text.default
  },

  surveyButton: {
    marginTop: 25,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary.variant,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center"
  },
  surveyText: {
    color: colors.onPrimary,
    textAlign: "center"
  }
});
