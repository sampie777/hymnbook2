import React from "react";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { ParamList, routes } from "../../navigation";
import ConfirmationModal from "../ConfirmationModal";

const InitDatabaseComponent: React.FC<{
  navigation: BottomTabNavigationProp<ParamList>,
  onCompleted?: () => void
}> = ({
        navigation,
        onCompleted
      }) => {

  const onConfirm = () => {
    navigation.navigate(routes.SongImport);
    onCompleted?.();
  };

  return <ConfirmationModal isOpen={true}
                            title={"Empty database"}
                            confirmText={"Let's go"}
                            invertConfirmColor={false}
                            onClose={undefined}
                            onConfirm={onConfirm}
                            message={`You don't have any songs in your database yet. Go to the ${routes.SongImport}-screen to download some songs!`} />;
};

export default InitDatabaseComponent;

