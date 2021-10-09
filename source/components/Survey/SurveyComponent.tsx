import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Survey } from "../../scripts/survey";
import ConfirmationModal from "../ConfirmationModal";
import { openLink } from "../../scripts/utils";

const SurveyComponent: React.FC<{
  onCompleted?: () => void,
  onDenied?: () => void
}> = ({
        onCompleted,
        onDenied
      }) => {

  const openSurvey = () => {
    openLink(Survey.url())
      .then(Survey.complete)
      .catch(e => Alert.alert("Error opening link", e.message))
      .finally(onCompleted);
  };

  return (<View style={styles.container}>
      <ConfirmationModal isOpen={true}
                         title={"Survey"}
                         closeText={"No, not now"}
                         confirmText={"Yes, I will"}
                         invertConfirmColor={true}
                         onClose={onDenied}
                         onConfirm={openSurvey}>
        <Text>
          To improve your experience with this app, we would like to get some feedback from our users.
        </Text>
        <Text style={styles.contentText}>
          Are you willing to answer two simple questions?
        </Text>
      </ConfirmationModal>
    </View>
  );
};

export default SurveyComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center"
  },
  popup: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30
  },
  contentText: {
    paddingTop: 10,
  }
});
