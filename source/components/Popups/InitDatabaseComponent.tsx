import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ConfirmationModal from "../ConfirmationModal";
import { routes } from "../../navigation";
import { DrawerNavigationHelpers } from "@react-navigation/drawer/src/types";

const InitDatabaseComponent: React.FC<{
  navigation: DrawerNavigationHelpers,
  onCompleted?: () => void
}> = ({
        navigation,
        onCompleted
      }) => {

  const onConfirm = () => {
    navigation.navigate(routes.Import);
    onCompleted?.();
  };

  return (<View style={styles.container}>
      <ConfirmationModal isOpen={true}
                         title={"Empty database"}
                         confirmText={"Let's go"}
                         invertConfirmColor={false}
                         onClose={undefined}
                         onConfirm={onConfirm}>
        <Text>
          You don't have any songs in your database yet. Go to the {routes.Import}-screen to download some songs!
        </Text>
      </ConfirmationModal>
    </View>
  );
};

export default InitDatabaseComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center"
  },
  popupContent: {},
  contentText: {
    paddingTop: 10
  }
});
