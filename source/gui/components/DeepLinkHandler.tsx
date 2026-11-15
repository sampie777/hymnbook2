import React, { PropsWithChildren, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { DatabasesRoute, ParamList, SongRoute } from "../../navigation";
import { Types } from "../screens/downloads/TypeSelectBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DeepLinking } from "../../logic/deeplinking";

interface Props extends PropsWithChildren {
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
    DeepLinking.registerRoute("/open/songs/:uuid/:verse", (route, { uuid, verse }: { uuid: string, verse: string }) => {
      const verseNum = parseInt(verse, 10);
      return navigation.navigate(SongRoute, {
        uuid: uuid,
        selectedVerses: [{ index: verseNum - 1 } as any]
      });
    });
    DeepLinking.registerRoute("/open/songs/:uuid", (route, { uuid }: { uuid: string }) => {
      return navigation.navigate(SongRoute, { uuid: uuid });
    });

    DeepLinking.setup();
    return DeepLinking.teardown;
  }, []);

  return <>{children}</>;
};

export default DeepLinkHandler;
