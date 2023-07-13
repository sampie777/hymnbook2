import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { DatabasesRoute, ParamList } from "../../navigation";
import { Types } from "../screens/downloads/TypeSelectBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DeepLinking } from "../../logic/deeplinking";

interface Props {
  children: React.ReactNode;
}

const DeepLinkHandler: React.FC<Props> = ({ children }) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamList, any>>();

  useEffect(() => {
    DeepLinking.registerRoute("/open/downloads/songs/:uuid", (route, { uuid }: { uuid: string }) => {
      return navigation.navigate(DatabasesRoute, { type: Types.Songs, promptForUuid: uuid });
    });
    DeepLinking.registerRoute("/open/downloads/documents/:uuid", (route, { uuid }: { uuid: string }) => {
      return navigation.navigate(DatabasesRoute, { type: Types.Documents, promptForUuid: uuid });
    });

    DeepLinking.setup();
    return DeepLinking.teardown;
  }, []);

  return <>{children}</>;
};

export default DeepLinkHandler;
