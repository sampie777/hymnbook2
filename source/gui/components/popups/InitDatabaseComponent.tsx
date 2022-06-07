import React from "react";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { ParamList, routes } from "../../../navigation";
import { Types } from "../../screens/downloads/TypeSelectBar";
import ConfirmationModal from "./ConfirmationModal";

const InitDatabaseComponent: React.FC<{
  navigation: BottomTabNavigationProp<ParamList>,
  onCompleted?: () => void
}> = ({
        navigation,
        onCompleted
      }) => {

  const onConfirm = () => {
    navigation.navigate(routes.Databases, { type: Types.Songs });
    onCompleted?.();
  };

  return <ConfirmationModal isOpen={true}
                            title={"Empty database"}
                            confirmText={"Let's go"}
                            invertConfirmColor={false}
                            onClose={undefined}
                            onConfirm={onConfirm}
                            message={`You don't have any songs in your database yet. Go to the ${routes.Databases}-screen to download some songs!`} />;
};

export default InitDatabaseComponent;

