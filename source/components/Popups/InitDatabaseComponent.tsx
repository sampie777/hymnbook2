import React from "react";
import ConfirmationModal from "../ConfirmationModal";
import { routes } from "../../navigation";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

const InitDatabaseComponent: React.FC<{
  navigation: BottomTabNavigationProp<any>,
  onCompleted?: () => void
}> = ({
        navigation,
        onCompleted
      }) => {

  const onConfirm = () => {
    navigation.navigate(routes.ImportSongs);
    onCompleted?.();
  };

  return <ConfirmationModal isOpen={true}
                            title={"Empty database"}
                            confirmText={"Let's go"}
                            invertConfirmColor={false}
                            onClose={undefined}
                            onConfirm={onConfirm}
                            message={`You don't have any songs in your database yet. Go to the ${routes.ImportSongs}-screen to download some songs!`} />;
};

export default InitDatabaseComponent;

